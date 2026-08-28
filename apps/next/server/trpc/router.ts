import { tracked } from "@trpc/server";
import { z } from "zod";
import { type ChatMessage, downstream } from "../downstream";
import { parseSseStream } from "../sse-parser";
import { publicProcedure, router } from "./init";

/**
 * BFF 라우터.
 * 모든 프로시저는 downstream(express 도메인 API)을 호출할 뿐,
 * 도메인 상태를 직접 들고 있지 않는다.
 */
export const appRouter = router({
  /** 도메인 서버 상태를 BFF 관점으로 가공해서 내려준다 */
  health: publicProcedure.query(async () => {
    const domain = await downstream.health();

    return {
      bff: "ok" as const,
      domain: domain.status,
      checkedAt: new Date().toISOString(),
    };
  }),

  chat: router({
    list: publicProcedure.query(() => downstream.listMessages()),

    send: publicProcedure
      .input(
        z.object({
          author: z.string().min(1).max(32),
          text: z.string().min(1).max(500),
        })
      )
      .mutation(({ input }) => downstream.sendMessage(input)),

    /**
     * downstream SSE를 중계하는 구독.
     * tracked()로 id를 붙이면 클라이언트 재연결 시 lastEventId가 넘어오고,
     * 그 값을 downstream에 그대로 전달해 놓친 메시지를 복구한다.
     */
    onAdd: publicProcedure
      .input(z.object({ lastEventId: z.string().nullish() }).optional())
      .subscription(async function* (opts) {
        const stream = await downstream.chatStream({
          lastEventId: opts.input?.lastEventId ?? undefined,
          signal: opts.signal,
        });

        for await (const event of parseSseStream<ChatMessage>(
          stream,
          opts.signal
        )) {
          yield tracked(event.id ?? event.data.id, event.data);
        }
      }),
  }),

  auth: router({
    login: publicProcedure
      .input(z.object({ userId: z.string().min(1) }))
      .mutation(({ input }) => downstream.login(input.userId)),

    /** 컨텍스트의 토큰으로 downstream 보호 리소스를 호출한다 */
    me: publicProcedure.query(({ ctx }) => {
      if (!ctx.token) return null;
      return downstream.protected(ctx.token);
    }),
  }),
});

export type AppRouter = typeof appRouter;
