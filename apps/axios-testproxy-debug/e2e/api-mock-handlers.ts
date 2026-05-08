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

// setApiMock: allra-front의 apiMockHandlers와 동일한 패턴
export function setApiMock(
  next: NextFixture,
  handlers: MockHandler[] = []
) {
  const defaultHandlers: MockHandler[] = [
    {
      match: (req) =>
        new URL(req.url).pathname === "/items" && req.method === "GET",
      response: MOCK_ITEMS,
    },
    {
      match: (req) =>
        /^\/items\/\d+$/.test(new URL(req.url).pathname) && req.method === "GET",
      response: (req: Request) => {
        const id = Number(new URL(req.url).pathname.split("/").pop());
        return MOCK_ITEMS.find((item) => item.id === id) ?? null;
      },
    },
  ];

  next.onFetch((request) => {
    // 커스텀 핸들러 우선
    for (const handler of handlers) {
      if (handler.match(request)) {
        return new Response(JSON.stringify(handler.response), {
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
            ? handler.response(request)
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
