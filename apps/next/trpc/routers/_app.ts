import { health, hello } from "@/lib/express-client";
import { baseProcedure, createTRPCRouter } from "../init";
import { authRouter } from "./auth.router";

/**
 * App Router
 * 모든 도메인 라우터를 병합하는 루트 라우터입니다.
 *
 * @example
 * // 클라이언트에서 호출 방법
 * trpc.health.query()           // 헬스 체크
 * trpc.hello.query()            // Hello
 * trpc.auth.login.mutation()    // 로그인
 * trpc.auth.logout.mutation()   // 로그아웃
 */
export const appRouter = createTRPCRouter({
  /**
   * Health Check Query
   * 서버 상태를 확인합니다.
   */
  health: baseProcedure.query(async () => {
    const data = await health();
    return data;
  }),

  /**
   * Hello Query
   * 간단한 테스트용 엔드포인트입니다.
   */
  hello: baseProcedure.query(async () => {
    const data = await hello();
    return data;
  }),

  /**
   * Auth Router
   * 인증 관련 모든 프로시저를 포함합니다.
   */
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
