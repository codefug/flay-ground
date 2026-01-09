import { z } from "zod";
import {
  getAllTokens,
  getProtectedData,
  getTokenByUserId,
  login,
  logout,
  refreshToken,
} from "@/lib/express-client";
import {
  baseProcedure,
  createTRPCRouter,
  loggerProcedure,
  protectedProcedure,
} from "../init";

/**
 * Auth Router
 * 인증 관련 프로시저를 담당합니다.
 */
export const authRouter = createTRPCRouter({
  /**
   * Login Mutation
   * userId로 로그인하여 access/refresh 토큰을 발급받습니다.
   * loggerProcedure를 사용하여 에러 로깅을 포함합니다.
   */
  login: loggerProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await login(input.userId);
      return data;
    }),

  /**
   * Refresh Token Mutation
   * refresh token으로 새로운 access token을 발급받습니다.
   */
  refreshToken: loggerProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await refreshToken(input.refreshToken);
      return data;
    }),

  /**
   * Logout Mutation
   * userId로 로그아웃하여 토큰을 무효화합니다.
   */
  logout: loggerProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await logout(input.userId);
      return data;
    }),

  /**
   * Get Protected Data Query
   * 보호된 데이터를 조회합니다.
   * protectedProcedure는 loggerProcedure를 nested하므로 자동으로 에러 로깅이 포함됩니다.
   */
  getProtectedData: protectedProcedure.query(async ({ ctx }) => {
    const data = await getProtectedData(ctx.accessToken);
    return {
      data,
      accessToken: ctx.accessToken,
    };
  }),

  /**
   * Get All Tokens Query (Dev Only)
   * 개발 환경에서 모든 토큰을 조회합니다.
   */
  getAllTokens: baseProcedure.query(async () => {
    const data = await getAllTokens();
    return data;
  }),

  /**
   * Get Token By User ID Query
   * 특정 userId의 토큰을 조회합니다.
   */
  getTokenByUserId: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const data = await getTokenByUserId(input.userId);
      return data;
    }),
});
