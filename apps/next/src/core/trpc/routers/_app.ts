import type { inferRouterOutputs } from "@trpc/server";
import { chatRouter } from "@/domain/chat/procedures/router";
import { healthRouter } from "@/domain/health/procedures/router";
import { createTRPCRouter } from "../server/base/init";

export const appRouter = createTRPCRouter({
  chat: chatRouter,
  health: healthRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type InferRouterOutputs = inferRouterOutputs<AppRouter>;
