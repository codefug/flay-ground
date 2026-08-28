import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
import { addMessage, ee, listMessages, messagesAfter } from "./events";
import { swaggerSpec } from "./swagger";

const app = express();
const PORT = process.env.PORT || 3002;

// JWT Secret Keys (실제 프로덕션에서는 환경변수로 관리)
const ACCESS_TOKEN_SECRET = "your-access-token-secret-key";
const REFRESH_TOKEN_SECRET = "your-refresh-token-secret-key";

// 토큰 저장소 (서버 전역 변수)
interface TokenStore {
	[userId: string]: {
		refreshToken: string;
		accessToken: string;
		createdAt: Date;
	};
}

const tokenStore: TokenStore = {};

// Middleware
// SSE는 EventSource로 붙기 때문에 credentials와 명시적 origin이 필요하다.
// (credentials: true일 때 origin에 "*"를 쓸 수 없다)
app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
	}),
);
app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: 헬스 체크
 *     description: 서버 상태 확인
 *     responses:
 *       200:
 *         description: 서버 정상 작동
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 로그인
 *     description: userId를 통해 accessToken과 refreshToken 발급
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user123
 *     responses:
 *       200:
 *         description: 토큰 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                   example: 900
 *       400:
 *         description: userId가 없음
 */
app.post("/api/auth/login", (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		return res.status(400).json({ error: "userId is required" });
	}

	// Access Token 생성 (15분 유효)
	const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	// Refresh Token 생성 (7일 유효)
	const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	// 토큰 저장소에 저장
	tokenStore[userId] = {
		accessToken,
		refreshToken,
		createdAt: new Date(),
	};

	res.json({
		accessToken,
		refreshToken,
		expiresIn: 900, // 15분 = 900초
	});
});

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 토큰 갱신
 *     description: refreshToken을 사용하여 새로운 accessToken 발급
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 새로운 accessToken 발급 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                   example: 900
 *       400:
 *         description: refreshToken이 없음
 *       401:
 *         description: 유효하지 않거나 만료된 refreshToken
 */
app.post("/api/auth/refresh", (req, res) => {
	const { refreshToken } = req.body;

	if (!refreshToken) {
		return res.status(400).json({ error: "refreshToken is required" });
	}

	try {
		// Refresh Token 검증
		const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as {
			userId: string;
		};

		// 저장소에서 해당 토큰 확인
		const storedToken = tokenStore[decoded.userId];
		if (!storedToken || storedToken.refreshToken !== refreshToken) {
			return res.status(401).json({ error: "Invalid refresh token" });
		}

		// 새로운 Access Token 생성
		const newAccessToken = jwt.sign(
			{ userId: decoded.userId },
			ACCESS_TOKEN_SECRET,
			{ expiresIn: "15m" },
		);

		// 저장소 업데이트
		tokenStore[decoded.userId].accessToken = newAccessToken;

		res.json({
			accessToken: newAccessToken,
			expiresIn: 900,
		});
	} catch {
		res.status(401).json({ error: "Invalid or expired refresh token" });
	}
});

/**
 * @openapi
 * /api/auth/tokens:
 *   get:
 *     tags:
 *       - Auth
 *     summary: 모든 토큰 조회 (개발용)
 *     description: 서버에 저장된 모든 유저의 토큰 정보 조회
 *     responses:
 *       200:
 *         description: 토큰 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: object
 *                 properties:
 *                   accessToken:
 *                     type: string
 *                   refreshToken:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
app.get("/api/auth/tokens", (_req, res) => {
	res.json(tokenStore);
});

/**
 * @openapi
 * /api/auth/tokens/{userId}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: 특정 유저의 토큰 조회
 *     description: userId로 특정 유저의 토큰 정보 조회
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 조회할 유저 ID
 *     responses:
 *       200:
 *         description: 토큰 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: 해당 유저의 토큰을 찾을 수 없음
 */
app.get("/api/auth/tokens/:userId", (req, res) => {
	const { userId } = req.params;
	const tokens = tokenStore[userId];

	if (!tokens) {
		return res.status(404).json({ error: "Tokens not found for this user" });
	}

	res.json(tokens);
});

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: 로그아웃
 *     description: 서버에서 유저의 토큰 삭제
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: user123
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         description: userId가 없음
 */
app.post("/api/auth/logout", (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		return res.status(400).json({ error: "userId is required" });
	}

	delete tokenStore[userId];

	res.json({ message: "Logged out successfully" });
});

/**
 * @openapi
 * /api/protected:
 *   get:
 *     tags:
 *       - Auth
 *     summary: 보호된 리소스
 *     description: Access Token 검증이 필요한 엔드포인트 예시
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 접근 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Protected data accessed successfully
 *                 userId:
 *                   type: string
 *       401:
 *         description: 토큰이 없거나 유효하지 않음
 */
app.get("/api/protected", (req, res) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ error: "No token provided" });
	}

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
			userId: string;
		};
		res.json({
			message: "Protected data accessed successfully",
			userId: decoded.userId,
		});
	} catch {
		res.status(401).json({ error: "Invalid or expired token" });
	}
});

/**
 * @openapi
 * /api/hello:
 *   get:
 *     tags:
 *       - Example
 *     summary: Hello World
 *     description: BFF 예제 엔드포인트
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Hello from Express BFF!
 *                 data:
 *                   type: object
 *                   properties:
 *                     framework:
 *                       type: string
 *                       example: Express
 *                     version:
 *                       type: string
 *                       example: 4.x
 */
app.get("/api/hello", (req, res) => {
	res.json({
		message: "Hello from Express BFF!",
		data: {
			framework: "Express",
			version: "4.x",
		},
	});
});

/**
 * @openapi
 * /api/chat/messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: 메시지 목록 조회
 *     responses:
 *       200:
 *         description: 메시지 배열
 */
app.get("/api/chat/messages", (_req, res) => {
	res.json(listMessages());
});

/**
 * @openapi
 * /api/chat/messages:
 *   post:
 *     tags:
 *       - Chat
 *     summary: 메시지 전송
 *     responses:
 *       201:
 *         description: 생성된 메시지
 *       400:
 *         description: author 또는 text 누락
 */
app.post("/api/chat/messages", (req, res) => {
	const { author, text } = req.body;

	if (!author || !text) {
		return res.status(400).json({ error: "author and text are required" });
	}

	res.status(201).json(addMessage(author, text));
});

/**
 * @openapi
 * /api/chat/stream:
 *   get:
 *     tags:
 *       - Chat
 *     summary: 메시지 SSE 스트림 (도메인 레벨)
 *     description: BFF(tRPC)가 소비하는 원본 스트림. 브라우저가 직접 붙지 않는다.
 *     responses:
 *       200:
 *         description: text/event-stream
 */
app.get("/api/chat/stream", (req, res) => {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache, no-transform",
		Connection: "keep-alive",
		// nginx 등 프록시가 스트림을 버퍼링하지 않도록
		"X-Accel-Buffering": "no",
	});

	// 재연결 시 놓친 메시지부터 복구
	const lastEventId = (req.headers["last-event-id"] ??
		req.query.lastEventId) as string | undefined;
	if (lastEventId) {
		for (const message of messagesAfter(lastEventId)) {
			res.write(`id: ${message.id}\ndata: ${JSON.stringify(message)}\n\n`);
		}
	}

	const onAdd = (message: { id: string }) => {
		res.write(`id: ${message.id}\ndata: ${JSON.stringify(message)}\n\n`);
	};
	ee.on("chat:add", onAdd);

	// 유휴 연결이 끊기지 않도록 주기적으로 주석 프레임을 보낸다
	const ping = setInterval(() => res.write(": ping\n\n"), 15_000);

	req.on("close", () => {
		clearInterval(ping);
		ee.off("chat:add", onAdd);
		res.end();
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
