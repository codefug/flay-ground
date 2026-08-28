import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "../base/init";

export const authMiddleware = createTRPCMiddleware(async ({ ctx, next }) => {
  const token = ctx.getToken();

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // 이후 프로시저에서 token이 확실히 존재하도록 좁혀서 넘긴다
  return next({ ctx: { ...ctx, token } });
});
