import { z } from "zod";
import {
  getAllTokens,
  getProtectedData,
  getTokenByUserId,
  health,
  hello,
  login,
  logout,
  refreshToken,
} from "@/lib/express-client";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "../init";

export const appRouter = createTRPCRouter({
  // Health check
  health: baseProcedure.query(async () => {
    const data = await health();
    return data;
  }),

  // Hello query
  hello: baseProcedure.query(async () => {
    const data = await hello();
    return data;
  }),

  // Login mutation
  login: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await login(input.userId);
      return data;
    }),

  // Refresh token mutation
  refreshToken: baseProcedure
    .input(
      z.object({
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await refreshToken(input.refreshToken);
      return data;
    }),

  // Protected data query
  getProtectedData: protectedProcedure.query(async ({ ctx }) => {
    const data = await getProtectedData(ctx.accessToken);
    return {
      data,
      accessToken: ctx.accessToken,
    };
  }),

  // Get all tokens query (dev only)
  getAllTokens: baseProcedure.query(async () => {
    const data = await getAllTokens();
    return data;
  }),

  // Get token by user ID query
  getTokenByUserId: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const data = await getTokenByUserId(input.userId);
      return data;
    }),

  // Logout mutation
  logout: baseProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const data = await logout(input.userId);
      return data;
    }),
});

export type AppRouter = typeof appRouter;
