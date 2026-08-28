import { request } from "@/core/api/client";
import { publicProcedure } from "@/core/trpc/client/procedures";
import { type GetChatListResponse, getChatListResponseSchema } from "./schema";

export const getChatListProcedure = publicProcedure
  .output(getChatListResponseSchema)
  .query(() => request<GetChatListResponse>("/api/chat/messages"));
