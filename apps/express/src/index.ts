import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";

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

// Health check endpoint
app.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 로그인 - accessToken과 refreshToken 발급
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

// Refresh Token으로 새로운 Access Token 발급
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

// 현재 저장된 모든 토큰 조회 (개발용)
app.get("/api/auth/tokens", (_req, res) => {
	res.json(tokenStore);
});

// 특정 유저의 토큰 조회
app.get("/api/auth/tokens/:userId", (req, res) => {
	const { userId } = req.params;
	const tokens = tokenStore[userId];

	if (!tokens) {
		return res.status(404).json({ error: "Tokens not found for this user" });
	}

	res.json(tokens);
});

// 로그아웃 - 토큰 삭제
app.post("/api/auth/logout", (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		return res.status(400).json({ error: "userId is required" });
	}

	delete tokenStore[userId];

	res.json({ message: "Logged out successfully" });
});

// Access Token 검증이 필요한 보호된 엔드포인트 예시
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

// Example BFF endpoint
app.get("/api/hello", (req, res) => {
	res.json({
		message: "Hello from Express BFF!",
		data: {
			framework: "Express",
			version: "4.x",
		},
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 Express server running on http://localhost:${PORT}`);
});
