import { expect, test } from "@playwright/test";
import { trpcMsw } from "../mocks/handlers";
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
    server.use(
      trpcMsw.hello.query(() => ({
        message: "Hello from Playwright Test!",
        data: {
          framework: "Express (Playwright Mock)",
          version: "4.x",
        },
      }))
    );

    await page.goto("/");
    await expect(page.getByText("Hello from Playwright Test!")).toBeVisible();
    await expect(page.getByText("Express (Playwright Mock)")).toBeVisible();
  });

  test("should successfully login with user ID", async ({ page }) => {
    server.use(
      trpcMsw.login.mutation(({ input }) => ({
        accessToken: `e2e-access-token-${input.userId}`,
        refreshToken: `e2e-refresh-token-${input.userId}`,
        expiresIn: 900,
      }))
    );

    await page.goto("/");
    await page.fill('input[placeholder="Enter user ID"]', "testuser");
    await page.click("button:has-text('Login')");

    await expect(page.getByText("Access Token:")).toBeVisible();
    await expect(page.getByText(/e2e-access-token-testuser/)).toBeVisible();
  });

  test("should show error when login fails", async ({ page }) => {
    server.use(
      trpcMsw.login.mutation(() => {
        throw new Error("Login failed in E2E test");
      })
    );

    await page.goto("/");
    await page.fill('input[placeholder="Enter user ID"]', "failuser");
    await page.click("button:has-text('Login')");

    await expect(page.getByText(/Error:/)).toBeVisible();
  });

  test("should disable button when input is empty", async ({ page }) => {
    await page.goto("/");
    const button = page.locator("button:has-text('Login')");
    await expect(button).toBeDisabled();

    await page.fill('input[placeholder="Enter user ID"]', "user");
    await expect(button).toBeEnabled();
  });
});
