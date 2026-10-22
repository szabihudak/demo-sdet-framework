import {
  test as frameworkTest,
  expect,
} from "@framework/fixtures/framework-fixtures";
import { AuthApiClient } from "@app/api/clients/AuthApiClient";
import { HomePage } from "@app/pages/HomePage";
import { LoginPage } from "@app/pages/LoginPage";

// Add application fixtures here (API clients, Page Objects, test data).
// See the fixture section of framework/docs/TESTING_STANDARDS.md and framework/templates/index.json.
type AppFixtures = {
  authApi: AuthApiClient;
  homePage: HomePage;
  loginPage: LoginPage;
};

export const test = frameworkTest.extend<AppFixtures>({
  authApi: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
