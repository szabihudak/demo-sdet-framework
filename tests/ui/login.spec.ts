import { test, expect } from "@app/fixtures/test-fixtures";
import { mockLoginServerError } from "@app/mocks/authApiMock";
import { getRoleCredentials } from "@framework/auth/credentials";

test.describe("Login page UI", () => {
  test("T008_Login_E2E: signs in and reaches the EventHub home page", async ({
    loginPage,
  }) => {
    const credentials = getRoleCredentials("user");
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);

    await expect(loginPage.page).toHaveURL(/\/$/);
    await expect(loginPage.homeHeading).toBeVisible();
  });

  test("T009_Login_E2E: shows email feedback and stays on the login page", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.fillPassword("NotARealPassword123");
    await loginPage.submit();

    await expect(loginPage.invalidEmailMessage).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login$/);
  });

  test("T010_Login_E2E: shows password feedback and stays on the login page", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.fillEmail("ui-test@example.invalid");
    await loginPage.submit();

    await expect(loginPage.passwordLengthMessage).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login$/);
  });

  test("T011_Login_E2E: shows an error toast when login returns a server error", async ({
    loginPage,
  }) => {
    await mockLoginServerError(loginPage.page);
    await loginPage.goto();
    await loginPage.login("ui-test@example.invalid", "NotARealPassword123");

    await expect(loginPage.errorToast).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login$/);
  });
});
