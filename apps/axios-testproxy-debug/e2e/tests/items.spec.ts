import { test, expect } from "next/experimental/testmode/playwright";
import { setApiMock } from "../api-mock-handlers";

test.describe("Items 페이지", () => {
  test.beforeEach(async ({ next }) => {
    setApiMock(next);
  });

  test("서버 컴포넌트에서 모킹된 items를 렌더링한다", async ({ page }) => {
    await page.goto("/items");

    // 서버 컴포넌트가 axios로 가져온 mock 데이터 확인
    const serverItems = page.getByTestId("server-items");
    await expect(serverItems).toBeVisible();

    await expect(page.getByTestId("server-item-1")).toContainText("Mock Item 1");
    await expect(page.getByTestId("server-item-2")).toContainText("Mock Item 2");
    await expect(page.getByTestId("server-item-3")).toContainText("Mock Item 3");
  });

  test("클라이언트 컴포넌트에서 tRPC를 통해 모킹된 items를 렌더링한다", async ({
    page,
  }) => {
    await page.goto("/items");

    // 클라이언트 컴포넌트가 tRPC를 통해 axios로 가져온 mock 데이터 확인
    const clientItems = page.getByTestId("client-items");
    await expect(clientItems).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId("client-item-1")).toContainText("Mock Item 1");
    await expect(page.getByTestId("client-item-2")).toContainText("Mock Item 2");
    await expect(page.getByTestId("client-item-3")).toContainText("Mock Item 3");
  });

  test("커스텀 mock으로 특정 item만 오버라이드 할 수 있다", async ({
    page,
    next,
  }) => {
    // 특정 API만 다른 데이터로 오버라이드
    setApiMock(next, [
      {
        match: (req) =>
          new URL(req.url).pathname === "/items" && req.method === "GET",
        response: [{ id: 99, name: "Custom Item" }],
      },
    ]);

    await page.goto("/items");

    const serverItems = page.getByTestId("server-items");
    await expect(serverItems).toBeVisible();
    await expect(page.getByTestId("server-item-99")).toContainText("Custom Item");
  });
});
