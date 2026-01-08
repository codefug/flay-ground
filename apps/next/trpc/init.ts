import { initTRPC } from "@trpc/server";
import superjson from "superjson";

/**
 * tRPC Context 생성 함수
 * 각 요청마다 새로운 context를 생성합니다.
 */
export async function createTRPCContext() {
  /**
   * Context에 필요한 데이터를 추가합니다.
   * 예: 사용자 세션, DB 연결 등
   */
  return {
    // Add context data here
  };
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
