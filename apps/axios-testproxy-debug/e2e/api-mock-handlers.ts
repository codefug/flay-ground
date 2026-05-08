import { addMinutes } from "date-fns";
import type { NextFixture } from "next/experimental/testmode/playwright";

type Item = { id: number; name: string };

const MOCK_ITEMS: Item[] = [
  { id: 1, name: "Mock Item 1" },
  { id: 2, name: "Mock Item 2" },
  { id: 3, name: "Mock Item 3" },
];

type MockHandler = {
  match: (request: Request) => boolean;
  response: unknown;
  status?: number;
};

function matchPath(req: Request, pathname: string, method: string): boolean {
  const url = new URL(req.url);
  return url.pathname === pathname && req.method === method;
}

function buildDefaultHandlers(): MockHandler[] {
  return [
    {
      match: (req) => matchPath(req, "/items", "GET"),
      response: MOCK_ITEMS,
    },
    {
      match: (req) =>
        /^\/items\/\d+$/.test(new URL(req.url).pathname) &&
        req.method === "GET",
      response: (req: Request) => {
        const id = Number(new URL(req.url).pathname.split("/").pop());
        return MOCK_ITEMS.find((item) => item.id === id) ?? null;
      },
    },
    {
      // refresh-token 성공 응답 (기본)
      match: (req) => matchPath(req, "/auth/refresh", "POST"),
      response: {
        meta: { code: "SUCCESS", message: "토큰 갱신 성공" },
        data: {
          accessToken: "new-access-token",
          expiredAt: addMinutes(new Date(), 30).toISOString(),
        },
      },
    },
  ];
}

// setApiMock: allra-front의 apiMockHandlers와 동일한 패턴
// extendsHandlers로 특정 API만 오버라이드 가능
export function setApiMock(next: NextFixture, handlers: MockHandler[] = []) {
  const defaultHandlers = buildDefaultHandlers();

  next.onFetch((request) => {
    // 커스텀 핸들러 우선
    for (const handler of handlers) {
      if (handler.match(request)) {
        const body =
          typeof handler.response === "function"
            ? (handler.response as (r: Request) => unknown)(request)
            : handler.response;
        return new Response(JSON.stringify(body), {
          status: handler.status ?? 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 기본 핸들러
    for (const handler of defaultHandlers) {
      if (handler.match(request)) {
        const body =
          typeof handler.response === "function"
            ? (handler.response as (r: Request) => unknown)(request)
            : handler.response;
        return new Response(JSON.stringify(body), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // tRPC 내부 요청 등 나머지는 통과
    return "continue";
  });
}

// refresh-token 실패 응답 (세션 만료 시나리오용)
export const REFRESH_TOKEN_UNAUTHORIZED: MockHandler = {
  match: (req) => matchPath(req, "/auth/refresh", "POST"),
  response: {
    meta: { code: "UNAUTHORIZED", message: "인증되지 않은 요청입니다." },
    data: null,
  },
};
