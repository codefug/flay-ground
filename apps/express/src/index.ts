import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import swaggerUi from "swagger-ui-express";
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
app.use(cors());
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
 * /api/data:
 *   get:
 *     tags:
 *       - Example
 *     summary: 데이터 조회 (성능 테스트용)
 *     description: 성능 비교 테스트를 위한 데이터 엔드포인트
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 데이터 ID
 *     responses:
 *       200:
 *         description: 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 data:
 *                   type: string
 *                 timestamp:
 *                   type: number
 */
app.get("/api/data", (req, res) => {
	const id = req.query.id;

	if (!id) {
		return res.status(400).json({ error: "id is required" });
	}

	// 시뮬레이션을 위한 약간의 지연
	setTimeout(() => {
		res.json({
			id: Number(id),
			data: `Express Data ${id}`,
			timestamp: Date.now(),
		});
	}, 10);
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
