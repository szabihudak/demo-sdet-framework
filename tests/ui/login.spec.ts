import { test, expect } from "@app/fixtures/test-fixtures";
import { mockLoginServerError } from "@app/mocks/authApiMock";
import { getRoleCredentials } from "@framework/auth/credentials";

const emptyCredentialScenarios = [
  {
    caseId: "T009_Login_E2E",
    name: "shows email feedback and stays on the login page",
    email: "",
    password: "NotARealPassword123",
    feedbackLocator: "invalidEmailMessage",
  },
  {
    caseId: "T010_Login_E2E",
    name: "shows password feedback and stays on the login page",
    email: "ui-test@example.invalid",
    password: "",
    feedbackLocator: "passwordLengthMessage",
  },
] satisfies {
  caseId: string;
  name: string;
  email: string;
  password: string;
  feedbackLocator: "invalidEmailMessage" | "passwordLengthMessage";
}[];

test.describe("Login page UI", () => {
  test("T008_Login_E2E: signs in and reaches the EventHub home page", async ({
    loginPage,
    homePage,
  }) => {
    const credentials = getRoleCredentials("user");
    await loginPage.goto();
    await loginPage.login(credentials.username, credentials.password);

    await expect(loginPage.page).toHaveURL(/\/$/);
    await expect(homePage.heading).toBeVisible();
    await expect(homePage.userEmail).toHaveText(credentials.username);
    await expect(homePage.logoutButton).toBeVisible();
    await expect(homePage.myBookingsNavigation).toBeVisible();
  });

  for (const scenario of emptyCredentialScenarios) {
    test(`${scenario.caseId}: ${scenario.name}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.fillEmail(scenario.email);
      await loginPage.fillPassword(scenario.password);
      await loginPage.submit();

      await expect(loginPage.heading).toBeVisible();
      await expect(loginPage[scenario.feedbackLocator]).toBeVisible();
      await expect(loginPage.page).toHaveURL(/\/login$/);
    });
  }

  test("T011_Login_E2E: shows an error toast when login returns a server error", async ({
    loginPage,
  }) => {
    await mockLoginServerError(loginPage.page);
    await loginPage.goto();
    await loginPage.login("ui-test@example.invalid", "NotARealPassword123");

    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.errorToast).toBeVisible();
    await expect(loginPage.page).toHaveURL(/\/login$/);
  });
});
