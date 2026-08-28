import { request } from "@/core/api/client";
import { publicProcedure } from "@/core/trpc/client/procedures";
import { getHealthResponseSchema } from "./schema";

/** 도메인 서버 상태를 BFF 관점으로 가공해서 내려준다 */
export const getHealthProcedure = publicProcedure
  .output(getHealthResponseSchema)
  .query(async () => {
    const domain = await request<{ status: string; timestamp: string }>(
      "/health"
    );

    return {
      bff: "ok" as const,
      domain: domain.status,
      checkedAt: new Date().toISOString(),
    };
  });
