"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import type { AppRouter } from "../server/trpc/router";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// BFF는 같은 오리진에 있으므로 상대 경로면 충분하다
const url = "/api/trpc";

function createClient() {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      /**
       * 구독만 SSE로 보내고 query/mutation은 배치 HTTP로 보낸다.
       * 구독을 배치 링크에 태우면 스트림이 배칭에 갇혀 동작하지 않는다.
       */
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({ url }),
        false: httpBatchLink({ url }),
      }),
    ],
  });
}

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  // 리렌더마다 새로 만들어지지 않도록 state에 담는다
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(createClient);

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
