import { TRPCError, initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { cache } from "react";
import superjson from "superjson";

/**
 * tRPC Context 생성 함수
 * 각 요청마다 새로운 context를 생성합니다.
 *
 * IMPORTANT: Next.js App Router에서는 FetchCreateContextFnOptions를 사용합니다.
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
  /**
   * Data transformer
   * superjson을 사용하면 Date, Map, Set 등의 타입을 직렬화할 수 있습니다.
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Logger Procedure
 * 에러 발생 시 로깅을 수행합니다.
 * 다른 procedure에 nested하여 사용할 수 있습니다.
 *
 * @example
 * // 로깅이 포함된 query
 * export const myQuery = loggerProcedure.query(() => {...});
 *
 * // protectedProcedure는 loggerProcedure를 nested하므로 자동으로 로깅 포함
 * export const myProtectedQuery = protectedProcedure.query(() => {...});
 */
export const loggerProcedure = baseProcedure.use(async (opts) => {
  const start = Date.now();
  const { path, type } = opts;

  try {
    const result = await opts.next();
    const durationMs = Date.now() - start;

    // 에러만 로깅
    if (!result.ok) {
      console.error("🐛 [tRPC 응답 오류]");
      console.error(`Path: ${path}`);
      console.error(`Type: ${type}`);
      console.error(`Duration: ${durationMs}ms`);
      console.error(`Error: ${JSON.stringify(result.error)}`);
    }

    return result;
  } catch (error) {
    const durationMs = Date.now() - start;

    // 에러 로깅
    console.error("🐛 [tRPC 요청 오류]");
    console.error(`Path: ${path}`);
    console.error(`Type: ${type}`);
    console.error(`Duration: ${durationMs}ms`);
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);

    throw error;
  }
});

/**
 * Protected Procedure
 * accessToken이 필요한 프로시저에 사용합니다.
 * loggerProcedure를 nested하여 사용하므로 자동으로 로깅이 포함됩니다.
 *
 * @example
 * export const getProtectedData = protectedProcedure.query(({ ctx }) => {
 *   // ctx.accessToken은 non-nullable로 타입이 좁혀짐
 *   return { token: ctx.accessToken };
 * });
 */
export const protectedProcedure = loggerProcedure.use(async ({ ctx, next }) => {
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
