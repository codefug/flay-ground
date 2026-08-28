import { z } from "zod";

export const onChatAddInputSchema = z
  .object({
    /**
     * 클라이언트가 마지막으로 받은 이벤트 id.
     * 재연결 시 tRPC가 자동으로 채워준다.
     */
    lastEventId: z.string().nullish(),
  })
  .optional();

export type OnChatAddInput = z.infer<typeof onChatAddInputSchema>;
