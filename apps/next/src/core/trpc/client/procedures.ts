import { createTRPCProcedure } from "../server/base/init";
import { authMiddleware } from "../server/middleware/auth-middleware";
import { errorMiddleware } from "../server/middleware/error-middleware";
import { loggingMiddleware } from "../server/middleware/logging-middleware";

export const publicProcedure = createTRPCProcedure
  .use(loggingMiddleware)
  .use(errorMiddleware);

export const protectedProcedure = createTRPCProcedure
  .use(loggingMiddleware)
  .use(errorMiddleware)
  .use(authMiddleware);
