import { initTRPC } from "@trpc/server";

export type Context = {
  /** 브라우저가 보낸 액세스 토큰 — downstream 호출에 그대로 전달한다 */
  token?: string;
};

const t = initTRPC.context<Context>().create({
  /**
   * SSE 설정.
   * - ping: 프록시/브라우저가 유휴 연결을 끊지 않도록 주기적으로 프레임을 보낸다.
   * - reconnectAfterInactivityMs: 이 시간 동안 이벤트가 없으면 클라이언트가 재연결한다.
   */
  sse: {
    ping: { enabled: true, intervalMs: 3_000 },
    client: { reconnectAfterInactivityMs: 10_000 },
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
