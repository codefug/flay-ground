import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/core/trpc/routers/_app";
import { createTRPCContext } from "@/core/trpc/server/base/init";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext(req),
  });

export { handler as GET, handler as POST };

// SSE 스트림이 잘리지 않도록 Node 런타임 + 동적 렌더링을 강제한다
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
