import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "../base/init";

export const errorMiddleware = createTRPCMiddleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `[Unknown Error] ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      cause: error,
    });
  }
});
