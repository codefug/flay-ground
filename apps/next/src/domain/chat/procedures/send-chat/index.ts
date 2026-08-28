import { request } from "@/core/api/client";
import { publicProcedure } from "@/core/trpc/client/procedures";
import {
  type SendChatResponse,
  sendChatInputSchema,
  sendChatResponseSchema,
} from "./schema";

export const sendChatProcedure = publicProcedure
  .input(sendChatInputSchema)
  .output(sendChatResponseSchema)
  .mutation(({ input }) =>
    request<SendChatResponse>("/api/chat/messages", {
      method: "POST",
      body: JSON.stringify(input),
    })
  );
