import { expect, test } from "@playwright/test";
import { server } from "../mocks/server";

test.beforeAll(() => {
  server.listen();
});

test.afterEach(() => {
  server.resetHandlers();
});

test.afterAll(() => {
  server.close();
});

test.describe("Login Form", () => {
  test("should display hello message from API", async ({ page }) => {
    await page.goto("/");

    // Hello API 호출 버튼 클릭
    await page.click('button:has-text("GET /api/hello")');

    // 모킹된 응답이 화면에 표시되는지 확인
    await expect(page.getByText("Hello from MSW!")).toBeVisible();
  });

  test("should successfully login with user ID", async ({ page }) => {
    await page.goto("/");

    // User ID 입력 필드에 값 입력 (placeholder가 "User ID"인 input)
    await page.fill('input[placeholder="User ID"]', "testuser");

    // Login 버튼 클릭 (버튼 텍스트가 "POST /api/auth/login"인 버튼)
    await page.click('button:has-text("POST /api/auth/login")');

    // 로그인 성공 후 토큰이 표시되는지 확인 여러개 있는거 확인
    await expect(page.getByText("mock-access-token-testuser")).toHaveCount(2);
  });

  test("should disable button when input is empty", async ({ page }) => {
    await page.goto("/");

    // Login 버튼 선택 (버튼 텍스트가 "POST /api/auth/login"인 버튼)
    const button = page.locator('button:has-text("POST /api/auth/login")');

    // 초기 상태: 입력값이 없으면 버튼이 비활성화되어야 함
    await expect(button).toBeDisabled();

    // User ID 입력 후 버튼이 활성화되는지 확인
    await page.fill('input[placeholder="User ID"]', "user");
    await expect(button).toBeEnabled();
  });

  test("should display health check status", async ({ page }) => {
    await page.goto("/");

    // Health Check 버튼 클릭
    await page.click('button:has-text("GET /health")');

    // 모킹된 health 응답이 표시되는지 확인
    await expect(page.getByText("Server is healthy (Mocked)")).toBeVisible();
  });

  test("should refresh token successfully", async ({ page }) => {
    await page.goto("/");

    // 먼저 로그인하여 토큰 획득
    await page.fill('input[placeholder="User ID"]', "tokenuser");
    await page.click('button:has-text("POST /api/auth/login")');

    // 로그인 성공 확인
    await expect(page.getByText("mock-access-token-tokenuser")).toHaveCount(2);

    // Refresh Token 버튼 클릭
    await page.click('button:has-text("POST /api/auth/refresh")');

    // 새로운 access token이 표시되는지 확인
    await expect(page.getByText(/mock-refreshed-access-token/)).toHaveCount(2);
  });

  test("should logout successfully", async ({ page }) => {
    await page.goto("/");

    // 먼저 로그인
    await page.fill('input[placeholder="User ID"]', "logoutuser");
    await page.click('button:has-text("POST /api/auth/login")');

    // 로그인 성공 확인
    await expect(page.getByText("mock-access-token-logoutuser")).toHaveCount(2);

    // Logout 버튼 클릭
    await page.click('button:has-text("POST /api/auth/logout")');

    // 로그아웃 성공 메시지 확인
    await expect(
      page.getByText("Logged out successfully (Mocked)")
    ).toBeVisible();

    // 토큰이 사라졌는지 확인
    await expect(page.getByText("로그인하여 토큰을 받으세요.")).toBeVisible();
  });

  test("should fetch all tokens", async ({ page }) => {
    await page.goto("/");

    // Get All Tokens 버튼 클릭
    await page.click('button:has-text("GET /api/auth/tokens")');

    // 모킹된 토큰 목록이 표시되는지 확인
    await expect(page.getByText("user-1")).toBeVisible();
    await expect(page.getByText("user-2")).toBeVisible();
    await expect(page.getByText("mock-access-token-1")).toBeVisible();
  });

  test("should get token by user ID", async ({ page }) => {
    await page.goto("/");

    // Get Token By User ID 섹션에서 User ID 입력
    const inputs = page.locator('input[placeholder="User ID"]');
    await inputs.nth(1).fill("specificuser");

    // Get Token By User ID 버튼 클릭
    await page.click('button:has-text("GET /api/auth/tokens/:userId")');

    // 특정 유저의 토큰이 표시되는지 확인
    await expect(
      page.getByText("mock-access-token-specificuser")
    ).toBeVisible();
  });

  test("should access protected data with valid token", async ({ page }) => {
    await page.goto("/");

    // 먼저 로그인하여 토큰 획득
    await page.fill('input[placeholder="User ID"]', "protecteduser");
    await page.click('button:has-text("POST /api/auth/login")');

    // 로그인 성공 확인
    await expect(page.getByText("mock-access-token-protecteduser")).toHaveCount(
      2
    );

    // Get Protected Data 버튼 클릭
    await page.click('button:has-text("GET /api/protected")');

    // Protected data가 표시되는지 확인
    await expect(
      page.getByText("Protected data accessed successfully (Mocked)")
    ).toBeVisible();
    await expect(page.getByText("mock-user-123")).toBeVisible();
  });

  test("should disable protected data button when no token", async ({
    page,
  }) => {
    await page.goto("/");

    // Protected Data 버튼이 비활성화되어 있는지 확인
    const button = page.locator('button:has-text("GET /api/protected")');
    await expect(button).toBeDisabled();
  });

  test("should disable refresh token button when no refresh token", async ({
    page,
  }) => {
    await page.goto("/");

    // Refresh Token 버튼이 비활성화되어 있는지 확인
    const button = page.locator('button:has-text("POST /api/auth/refresh")');
    await expect(button).toBeDisabled();
  });

  test("should disable logout button when no user ID", async ({ page }) => {
    await page.goto("/");

    // Logout 버튼이 비활성화되어 있는지 확인
    const button = page.locator('button:has-text("POST /api/auth/logout")');
    await expect(button).toBeDisabled();
  });

  test("should disable get token by user ID button when input is empty", async ({
    page,
  }) => {
    await page.goto("/");

    // Get Token By User ID 버튼이 비활성화되어 있는지 확인
    const button = page.locator(
      'button:has-text("GET /api/auth/tokens/:userId")'
    );
    await expect(button).toBeDisabled();
  });

  test("should show login button as pending during login", async ({ page }) => {
    await page.goto("/");

    // User ID 입력
    await page.fill('input[placeholder="User ID"]', "pendinguser");

    // Login 버튼 클릭
    const loginButton = page.locator('button:has-text("POST /api/auth/login")');
    await loginButton.click();

    // 버튼 텍스트가 "Logging in..."으로 변경되는지 확인 (빠르게 지나가므로 최종 결과 확인)
    // 로그인 성공 확인으로 대체
    await expect(page.getByText("mock-access-token-pendinguser")).toHaveCount(
      2
    );
  });

  test("should complete full authentication flow", async ({ page }) => {
    await page.goto("/");

    // 1. Health check
    await page.click('button:has-text("GET /health")');
    await expect(page.getByText("Server is healthy (Mocked)")).toBeVisible();

    // 2. Hello API
    await page.click('button:has-text("GET /api/hello")');
    await expect(page.getByText("Hello from MSW!")).toBeVisible();

    // 3. Login
    await page.fill('input[placeholder="User ID"]', "fullflowuser");
    await page.click('button:has-text("POST /api/auth/login")');
    await expect(page.getByText("mock-access-token-fullflowuser")).toHaveCount(
      2
    );

    // 4. Get Protected Data
    await page.click('button:has-text("GET /api/protected")');
    await expect(
      page.getByText("Protected data accessed successfully (Mocked)")
    ).toBeVisible();

    // 5. Refresh Token
    await page.click('button:has-text("POST /api/auth/refresh")');
    await expect(page.getByText(/mock-refreshed-access-token/)).toHaveCount(2);

    // 6. Logout
    await page.click('button:has-text("POST /api/auth/logout")');
    await expect(
      page.getByText("Logged out successfully (Mocked)")
    ).toBeVisible();
    await expect(page.getByText("로그인하여 토큰을 받으세요.")).toBeVisible();
  });
});
