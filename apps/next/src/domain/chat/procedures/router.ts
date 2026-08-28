import { createTRPCRouter } from "@/core/trpc/server/base/init";
import { getChatListProcedure } from "./get-chat-list";
import { onChatAddProcedure } from "./on-chat-add";
import { sendChatProcedure } from "./send-chat";

export const chatRouter = createTRPCRouter({
  list: getChatListProcedure,
  send: sendChatProcedure,
  onAdd: onChatAddProcedure,
});
