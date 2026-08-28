import { z } from "zod";
import { chatMessageSchema } from "../../schema";

export const getChatListResponseSchema = z.array(chatMessageSchema);

export type GetChatListResponse = z.infer<typeof getChatListResponseSchema>;
