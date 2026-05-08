import { TRPCError } from "@trpc/server";
import { addMinutes } from "date-fns";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { z } from "zod";
import { client } from "@/api/axios/client";
import { type SessionData, sessionOptions } from "@/session/options";
import { createCallerFactory, createTRPCRouter, publicProcedure } from "./init";

export const appRouter = createTRPCRouter({
  items: createTRPCRouter({
    list: publicProcedure.query(async () => {
      // axios로 외부 API 호출 — testProxy가 이걸 인터셉트해야 함
      const response = await client.get<{ id: number; name: string }[]>(
        "/items"
      );
      return response.data;
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const response = await client.get<{ id: number; name: string }>(
          `/items/${input.id}`
        );
        return response.data;
      }),
  }),

  auth: createTRPCRouter({
    // 세션 조회 (클라이언트에서 폴링)
    getSession: publicProcedure.query(async () => {
      const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions
      );
      if (!session.accessToken) return null;
      return {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiredAt: session.expiredAt,
      };
    }),

    // 로그인 (테스트용 — 항상 성공, expiredAt을 30분 후로 설정)
    signIn: publicProcedure.mutation(async () => {
      const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions
      );
      session.accessToken = "mock-access-token";
      session.refreshToken = "mock-refresh-token";
      session.expiredAt = addMinutes(new Date(), 30).toISOString();
      await session.save();
      return { success: true, expiredAt: session.expiredAt };
    }),

    // 토큰 갱신 — axios로 외부 API 호출, testProxy가 인터셉트
    // 성공 시 세션 갱신, 실패(401/UNAUTHORIZED) 시 TRPCError throw
    refreshToken: publicProcedure
      .input(z.object({ refreshToken: z.string() }))
      .mutation(async ({ input }) => {
        const response = await client.post<{
          meta: { code: string; message: string };
          data: { accessToken: string; expiredAt: string } | null;
        }>("/auth/refresh", { refreshToken: input.refreshToken });

        if (response.data.meta.code !== "SUCCESS" || !response.data.data) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "리프레시 토큰이 만료되었습니다.",
          });
        }

        // 세션 갱신
        const session = await getIronSession<SessionData>(
          await cookies(),
          sessionOptions
        );
        session.accessToken = response.data.data.accessToken;
        session.expiredAt = response.data.data.expiredAt;
        await session.save();

        return response.data;
      }),

    // 로그아웃
    signOut: publicProcedure.mutation(async () => {
      const session = await getIronSession<SessionData>(
        await cookies(),
        sessionOptions
      );
      session.destroy();
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;

const createCaller = createCallerFactory(appRouter);

export const getServerCaller = async () => {
  return createCaller({});
};
