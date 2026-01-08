import type { RequestHandler } from "msw";
import { createTRPCMsw, httpLink } from "msw-trpc";
import superjson from "superjson";
import type { AppRouter } from "@/trpc/routers/_app";

export const trpcMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: "/api/trpc",
    }),
  ],
  transformer: {
    input: superjson,
    output: superjson,
  },
});

export const handlers: RequestHandler[] = [
  // Health check 모킹
  trpcMsw.health.query(() => {
    return {
      status: "ok",
      message: "Server is healthy (Mocked)",
    };
  }),

  // Hello query 모킹
  trpcMsw.hello.query(() => {
    return {
      message: "Hello from MSW!",
      data: {
        framework: "Express (Mocked)",
        version: "4.x",
      },
    };
  }),

  // Login mutation 모킹
  trpcMsw.login.mutation(({ input }) => {
    if (!input || !input.userId) {
      throw new Error("userId is required");
    }
    return {
      accessToken: `mock-access-token-${input.userId}`,
      refreshToken: `mock-refresh-token-${input.userId}`,
      expiresIn: 900,
    };
  }),

  // Refresh token mutation 모킹
  trpcMsw.refreshToken.mutation(({ input }) => {
    if (!input || !input.refreshToken) {
      throw new Error("refreshToken is required");
    }
    return {
      accessToken: `mock-refreshed-access-token-${Date.now()}`,
      expiresIn: 900,
    };
  }),

  // Protected data query 모킹
  trpcMsw.getProtectedData.query(() => {
    return {
      data: {
        message: "Protected data accessed successfully (Mocked)",
        userId: "mock-user-123",
      },
      accessToken: "mock-access-token-123",
    };
  }),

  // Get all tokens query 모킹
  trpcMsw.getAllTokens.query(() => {
    return {
      tokens: [
        {
          userId: "user-1",
          accessToken: "mock-access-token-1",
          refreshToken: "mock-refresh-token-1",
        },
        {
          userId: "user-2",
          accessToken: "mock-access-token-2",
          refreshToken: "mock-refresh-token-2",
        },
      ],
    };
  }),

  // Get token by user ID query 모킹
  trpcMsw.getTokenByUserId.query(({ input }) => {
    if (!input || !input.userId) {
      throw new Error("userId is required");
    }
    return {
      userId: input.userId,
      accessToken: `mock-access-token-${input.userId}`,
      refreshToken: `mock-refresh-token-${input.userId}`,
    };
  }),

  // Logout mutation 모킹
  trpcMsw.logout.mutation(() => {
    // input은 선택적이지만 타입 안전성을 위해 받음
    return {
      message: "Logged out successfully (Mocked)",
    };
  }),
];
