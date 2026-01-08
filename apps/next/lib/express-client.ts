/**
 * Express API 클라이언트
 * Next.js 서버에서 Express 앱과 REST API로 통신합니다.
 *
 * Express 서버는 http://localhost:3002 에서 실행됩니다.
 */
import axios, { type AxiosError } from "axios";

/**
 * Express API의 base URL을 반환합니다.
 */
function getExpressApiUrl(): string {
  const baseUrl =
    process.env.EXPRESS_API_URL ||
    process.env.NEXT_PUBLIC_EXPRESS_API_URL ||
    "http://localhost:3002";
  return baseUrl;
}

/**
 * 공통 axios 설정
 */
const axiosInstance = axios.create({
  baseURL: getExpressApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10초 타임아웃
});

// 응답 인터셉터: 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // 서버가 응답했지만 에러 상태 코드
      const errorMessage =
        (error.response.data as { error?: string })?.error ||
        error.response.statusText ||
        "Request failed";
      throw new Error(errorMessage);
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      throw new Error("Network error: No response from server");
    } else {
      // 요청 설정 중 에러 발생
      throw new Error(error.message || "Request setup error");
    }
  }
);

/**
 * GET /api/hello
 * Hello World 엔드포인트
 */
export async function hello() {
  const response = await axiosInstance.get("/api/hello");
  return response.data;
}

/**
 * POST /api/auth/login
 * 로그인 및 토큰 발급
 * @param userId - 사용자 ID
 */
export async function login(userId: string) {
  const response = await axiosInstance.post("/api/auth/login", {
    userId,
  });
  return response.data;
}

/**
 * GET /api/protected
 * 보호된 리소스 접근 (Access Token 필요)
 * @param accessToken - JWT Access Token
 */
export async function getProtectedData(accessToken: string) {
  const response = await axiosInstance.get("/api/protected", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
}

/**
 * POST /api/auth/logout
 * 로그아웃
 * @param userId - 사용자 ID
 */
export async function logout(userId: string) {
  const response = await axiosInstance.post("/api/auth/logout", {
    userId,
  });
  return response.data;
}

/**
 * GET /health
 * 헬스 체크
 */
export async function health() {
  const response = await axiosInstance.get("/health");
  return response.data;
}

/**
 * POST /api/auth/refresh
 * 토큰 갱신
 * @param refreshToken - Refresh Token
 */
export async function refreshToken(refreshToken: string) {
  const response = await axiosInstance.post("/api/auth/refresh", {
    refreshToken,
  });
  return response.data;
}

/**
 * GET /api/auth/tokens
 * 모든 토큰 조회 (개발용)
 */
export async function getAllTokens() {
  const response = await axiosInstance.get("/api/auth/tokens");
  return response.data;
}

/**
 * GET /api/auth/tokens/:userId
 * 특정 유저의 토큰 조회
 * @param userId - 사용자 ID
 */
export async function getTokenByUserId(userId: string) {
  const response = await axiosInstance.get(`/api/auth/tokens/${userId}`);
  return response.data;
}

