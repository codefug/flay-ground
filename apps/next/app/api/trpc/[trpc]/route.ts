import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { NextRequest } from "next/server";
import { appRouter } from "../../../../server/trpc/router";

/**
 * BFF 엔드포인트.
 * query/mutation과 SSE 구독 모두 이 한 경로에서 처리된다.
 */
function handler(req: NextRequest) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      const authHeader = req.headers.get("authorization");
      const bearer = authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : undefined;

      // EventSource는 커스텀 헤더를 못 싣기 때문에 쿼리스트링도 확인한다
      return {
        token: bearer ?? req.nextUrl.searchParams.get("token") ?? undefined,
      };
    },
  });
}

export { handler as GET, handler as POST };

// SSE 스트림이 잘리지 않도록 Node 런타임 + 동적 렌더링을 강제한다
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
