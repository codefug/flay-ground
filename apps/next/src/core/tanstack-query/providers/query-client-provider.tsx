"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";
import type { TRPCClient } from "@trpc/client";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  splitLink,
} from "@trpc/client";
import { useState } from "react";
import { TRPCProvider } from "@/core/trpc/client/client";
import type { AppRouter } from "@/core/trpc/routers/_app";
import { getQueryClient } from "../client";

// BFF는 같은 오리진에 있으므로 상대 경로면 충분하다
const TRPC_URL = "/api/trpc";

// 구독만 SSE(httpSubscriptionLink)로 보내고 나머지는 batch 유지.
// 구독을 배치 링크에 태우면 스트림이 배칭에 갇혀 동작하지 않음
const createTransportLink = () =>
  splitLink({
    condition: (op) => op.type === "subscription",
    true: httpSubscriptionLink({ url: TRPC_URL }),
    false: httpBatchLink({ url: TRPC_URL }),
  });

export const QueryClientProvider = ({
  children,
  queryClient,
  trpcClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  trpcClient?: TRPCClient<AppRouter>;
}) => {
  const [defaultTrpcClient] = useState(() =>
    createTRPCClient<AppRouter>({ links: [createTransportLink()] })
  );
  const [defaultQueryClient] = useState(getQueryClient);

  const resolvedQueryClient = queryClient ?? defaultQueryClient;
  const resolvedTrpcClient = trpcClient ?? defaultTrpcClient;

  return (
    <TanstackQueryClientProvider client={resolvedQueryClient}>
      <TRPCProvider
        trpcClient={resolvedTrpcClient}
        queryClient={resolvedQueryClient}
      >
        {children}
      </TRPCProvider>
    </TanstackQueryClientProvider>
  );
};
