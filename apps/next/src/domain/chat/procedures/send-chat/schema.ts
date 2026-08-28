import { z } from "zod";
import { chatMessageSchema } from "../../schema";

export const sendChatInputSchema = z.object({
  author: z.string().min(1).max(32),
  text: z.string().min(1).max(500),
});

export type SendChatInput = z.infer<typeof sendChatInputSchema>;

export const sendChatResponseSchema = chatMessageSchema;

export type SendChatResponse = z.infer<typeof sendChatResponseSchema>;
