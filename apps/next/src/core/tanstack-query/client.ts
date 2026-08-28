import { QueryClient } from "@tanstack/react-query";

export const getQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // SSR 직후 곧바로 재요청하지 않도록 짧은 staleTime을 둔다
        staleTime: 30 * 1000,
      },
    },
  });
