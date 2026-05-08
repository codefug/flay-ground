import { expect, test } from "next/experimental/testmode/playwright";
import { REFRESH_TOKEN_UNAUTHORIZED, setApiMock } from "../api-mock-handlers";

test.describe("세션 만료 플로우", () => {
  /**
   * @시나리오
   * - 로그인 후 30분 경과 → refresh-token 성공 → 세션 만료 토스트 미노출
   * @검증
   * - axios@1.15.0: testProxy가 /auth/refresh 인터셉트 → 갱신 성공 → 토스트 없음
   * - axios@1.16.0: http adapter 동작 변화로 인터셉트 실패 시 NetworkError → 토스트 노출
   */
  test("토큰 갱신 성공 — 세션 만료 토스트 미노출", async ({ page, next }) => {
    setApiMock(next);

    // clock 먼저 설치 후 페이지 이동 (setInterval이 clock 안에서 등록되게)
    await page.clock.install();
    await page.goto("/session");

    await page.getByTestId("sign-in-button").click();
    await expect(page.getByTestId("session-authenticated")).toBeVisible({
      timeout: 5000,
    });

    // 29분 50초 앞으로
    await page.clock.fastForward("29:50");

    const toast = page.getByTestId("session-expired-toast");

    // 1초씩 틱하며 interval 발동 — 토스트가 끝까지 안 뜨면 성공
    await expect
      .poll(
        async () => {
          await page.clock.fastForward("00:00:01");
          return toast.isVisible().catch(() => false);
        },
        { timeout: 30000, intervals: [500] }
      )
      .toBe(false);
  });

  /**
   * @시나리오
   * - 로그인 후 30분 경과 → refresh-token 실패(UNAUTHORIZED) → 세션 만료 토스트 노출
   */
  test("토큰 갱신 실패 — 세션 만료 토스트 노출", async ({ page, next }) => {
    setApiMock(next, [REFRESH_TOKEN_UNAUTHORIZED]);

    await page.clock.install();
    await page.goto("/session");

    await page.getByTestId("sign-in-button").click();
    await expect(page.getByTestId("session-authenticated")).toBeVisible({
      timeout: 5000,
    });

    await page.clock.fastForward("29:50");

    const toast = page.getByTestId("session-expired-toast");

    // 1초씩 틱하며 interval 발동 — 토스트가 떠야 성공
    await expect
      .poll(
        async () => {
          const isVisible = await toast.isVisible().catch(() => false);
          if (isVisible) return true;
          await page.clock.fastForward("00:00:01");
          return toast.isVisible().catch(() => false);
        },
        { timeout: 30000, intervals: [100] }
      )
      .toBe(true);
  });
});
