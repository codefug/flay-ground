import { expect, test } from "next/experimental/testmode/playwright";
import { REFRESH_TOKEN_UNAUTHORIZED, setApiMock } from "../api-mock-handlers";

// allra-front의 refresh-token.spec.ts 패턴을 그대로 재현
test.describe("세션 만료 플로우", () => {
  /**
   * @시나리오
   * - 로그인 후 30분 경과 → refresh-token 성공 → 세션 만료 토스트 미노출
   * @조건
   * - axios@1.15.0: testProxy가 /auth/refresh 요청을 정상 인터셉트
   * - axios@1.16.0: 인터셉트 실패 시 Network Error → TRPCError 발생
   * @검증
   * - 세션 만료 토스트가 노출되지 않아야 함 (refresh 성공)
   */
  test("토큰 갱신 성공 — 세션 만료 토스트 미노출", async ({ page, next }) => {
    setApiMock(next); // 기본: /auth/refresh → SUCCESS

    await page.clock.install();
    await page.goto("/session");

    // 로그인
    await page.getByTestId("sign-in-button").click();
    await expect(page.getByTestId("session-authenticated")).toBeVisible({
      timeout: 5000,
    });

    // 30분 경과 시뮬레이션 (SessionManager가 체크 시작)
    await page.clock.fastForward("29:50");

    const toast = page.getByTestId("session-expired-toast");

    // 세션 만료 토스트가 노출되지 않아야 함 (refresh 성공했으므로)
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
   * @조건
   * - /auth/refresh를 UNAUTHORIZED로 오버라이드
   * @검증
   * - 세션 만료 토스트가 노출되어야 함
   */
  test("토큰 갱신 실패 — 세션 만료 토스트 노출", async ({ page, next }) => {
    // refresh-token을 UNAUTHORIZED로 오버라이드
    setApiMock(next, [REFRESH_TOKEN_UNAUTHORIZED]);

    await page.clock.install();
    await page.goto("/session");

    // 로그인
    await page.getByTestId("sign-in-button").click();
    await expect(page.getByTestId("session-authenticated")).toBeVisible({
      timeout: 5000,
    });

    // 30분 경과 시뮬레이션
    await page.clock.fastForward("29:50");

    const toast = page.getByTestId("session-expired-toast");

    // 세션 만료 토스트가 노출되어야 함
    await expect
      .poll(
        async () => {
          await page.clock.fastForward("00:00:01");
          return toast.isVisible().catch(() => false);
        },
        { timeout: 30000, intervals: [500] }
      )
      .toBe(true);
  });
});
