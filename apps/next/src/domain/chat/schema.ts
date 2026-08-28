import { z } from "zod";

export const chatMessageSchema = z.object({
  id: z.string(),
  author: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
