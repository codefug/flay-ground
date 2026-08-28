import { initTRPC } from "@trpc/server";

export interface TRPCContext {
  /** 브라우저가 보낸 액세스 토큰. downstream 호출에 그대로 전달한다 */
  getToken: () => string | undefined;
}

/**
 * route handler는 요청마다 새로 만들어지므로 context에 클로저로 값을 담아 공유한다.
 * EventSource는 커스텀 헤더를 못 싣기 때문에 쿼리스트링 토큰도 함께 확인한다.
 */
export const createTRPCContext = (req: Request): TRPCContext => {
  let token: string | undefined | null = null;

  return {
    getToken: () => {
      if (token === null) {
        const authHeader = req.headers.get("authorization");
        const bearer = authHeader?.startsWith("Bearer ")
          ? authHeader.slice("Bearer ".length)
          : undefined;
        token =
          bearer ?? new URL(req.url).searchParams.get("token") ?? undefined;
      }
      return token;
    },
  };
};

const t = initTRPC.context<TRPCContext>().create({
  /**
   * SSE 설정.
   * - ping: 프록시나 브라우저가 유휴 연결을 끊지 않도록 주기적으로 프레임을 보낸다.
   * - reconnectAfterInactivityMs: 이 시간 동안 이벤트가 없으면 클라이언트가 재연결한다.
   */
  sse: {
    ping: { enabled: true, intervalMs: 3_000 },
    client: { reconnectAfterInactivityMs: 10_000 },
  },
});

export const createTRPCRouter = t.router;
export const createTRPCMiddleware = t.middleware;
export const createCallerFactory = t.createCallerFactory;
export const createTRPCProcedure = t.procedure;
