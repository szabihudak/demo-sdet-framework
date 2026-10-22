import {
  test as frameworkTest,
  expect,
} from "@framework/fixtures/framework-fixtures";
import { AuthApiClient } from "@app/api/clients/AuthApiClient";

// Add application fixtures here (API clients, Page Objects, test data).
// See the fixture section of framework/docs/TESTING_STANDARDS.md and framework/templates/index.json.
type AppFixtures = {
  authApi: AuthApiClient;
};

export const test = frameworkTest.extend<AppFixtures>({
  authApi: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },
});

export { expect };
