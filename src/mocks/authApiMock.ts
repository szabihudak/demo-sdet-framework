import type { Page } from "@playwright/test";

const LOGIN_API_PATTERN = "**/api/auth/login";

export async function mockLoginServerError(page: Page): Promise<void> {
  await page.route(LOGIN_API_PATTERN, async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        success: false,
        error: "Internal Server Error",
      }),
    });
  });
}
