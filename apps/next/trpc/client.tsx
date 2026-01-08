"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, httpLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();

  return `${base}/api/trpc`;
}

export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() => {
    // MSW가 활성화된 경우 httpLink 사용 (msw-trpc는 배치 미지원)
    // 프로덕션에서는 httpBatchLink 사용 (성능 최적화)
    // NEXT_PUBLIC_MSW 환경 변수로 MSW 사용 여부 제어
    const useMSW =
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_MSW === "true";

    return createTRPCClient<AppRouter>({
      links: [
        useMSW
          ? httpLink({
              transformer: superjson,
              url: getUrl(),
            })
          : httpBatchLink({
              transformer: superjson,
              url: getUrl(),
            }),
      ],
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
