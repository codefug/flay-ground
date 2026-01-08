import { TRPCError, initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { cache } from "react";
import superjson from "superjson";

/**
 * tRPC Context 생성 함수
 * 각 요청마다 새로운 context를 생성합니다.
 */
export const createTRPCContext = cache(async (opts?: FetchCreateContextFnOptions) => {
  /**
   * Context에 필요한 데이터를 추가합니다.
   * 예: 사용자 세션, DB 연결 등
   */

  // 헤더에서 인증 토큰 추출
  const authHeader = opts?.req?.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  return {
    accessToken,
    headers: opts?.req?.headers,
    requestId: crypto.randomUUID(),
  };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Protected Procedure
 * accessToken이 필요한 프로시저에 사용합니다.
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.accessToken) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "인증이 필요합니다. accessToken을 제공해주세요.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      accessToken: ctx.accessToken, // non-nullable로 타입 보장
    },
  });
});
