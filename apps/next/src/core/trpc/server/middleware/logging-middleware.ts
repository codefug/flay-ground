import { createTRPCMiddleware } from "../base/init";

export const loggingMiddleware = createTRPCMiddleware(
  async ({ path, type, next }) => {
    const start = Date.now();
    const result = await next();
    const duration = Date.now() - start;

    if (!result.ok) {
      const cause = result.error.cause;
      console.error(
        `🐛 [tRPC 오류] Procedure: ${path} | Type: ${type.toUpperCase()} | Duration: ${duration}ms | Code: ${result.error.code} | Message: ${
          cause instanceof Error ? cause.message : "Unknown Error"
        }`
      );
    }

    return result;
  }
);
