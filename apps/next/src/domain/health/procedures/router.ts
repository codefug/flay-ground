import { createTRPCRouter } from "@/core/trpc/server/base/init";
import { getHealthProcedure } from "./get-health";

export const healthRouter = createTRPCRouter({
  get: getHealthProcedure,
});
