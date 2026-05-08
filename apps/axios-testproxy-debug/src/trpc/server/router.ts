import { z } from "zod";
import { client } from "@/api/axios/client";
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
});

export type AppRouter = typeof appRouter;

const createCaller = createCallerFactory(appRouter);

export const getServerCaller = async () => {
  return createCaller({});
};
