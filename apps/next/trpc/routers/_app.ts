import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import {
  hello,
  login,
  getProtectedData,
  logout,
  health,
  refreshToken,
  getAllTokens,
  getTokenByUserId,
} from "@/lib/express-client";

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
  getProtectedData: baseProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const data = await getProtectedData(input.accessToken);
      return data;
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
