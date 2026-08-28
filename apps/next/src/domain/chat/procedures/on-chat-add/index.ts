import { tracked } from "@trpc/server";
import { requestStream } from "@/core/api/client";
import { publicProcedure } from "@/core/trpc/client/procedures";
import { parseSseStream } from "@/core/trpc/utils/parse-sse-stream";
import type { ChatMessage } from "../../schema";
import { onChatAddInputSchema } from "./schema";

/**
 * downstream SSE를 중계하는 구독.
 * tracked()로 id를 붙이면 재연결 시 lastEventId가 넘어오고,
 * 그 값을 downstream에 그대로 전달해 놓친 메시지를 복구한다.
 *
 * 구독은 output() 스키마를 쓰지 않는다 — tracked() 래핑과 충돌한다.
 */
export const onChatAddProcedure = publicProcedure
  .input(onChatAddInputSchema)
  .subscription(async function* ({ input, signal }) {
    const stream = await requestStream({
      path: "/api/chat/stream",
      lastEventId: input?.lastEventId ?? undefined,
      signal,
    });

    for await (const event of parseSseStream<ChatMessage>(stream, signal)) {
      yield tracked(event.id ?? event.data.id, event.data);
    }
  });
