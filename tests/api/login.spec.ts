import { test, expect } from "@app/fixtures/test-fixtures";
import { API_ERRORS } from "@app/api/constants/apiErrors";
import { meResponseSchema } from "@app/api/schemas/MeResponseSchema";
import type { LoginRequestInput } from "@app/api/schemas/LoginRequestSchema";
import { loginResponseSchema } from "@app/api/schemas/LoginResponseSchema";
import { getRoleCredentials } from "@framework/auth/credentials";
import { HTTP_STATUS } from "@framework/api/httpStatuses";
import { validateSchema } from "@framework/api/SchemaValidator";

type LoginScenario = {
  caseId: string;
  name: string;
  credentials: LoginRequestInput;
  expectedError: string;
  expectedDetailFields: string[];
};

type ConfiguredEmailScenario = Omit<LoginScenario, "credentials"> & {
  credentials: Omit<LoginRequestInput, "email">;
};

const fixedCredentialScenarios = [
  {
    caseId: "T002_Login_API",
    name: "rejects login when email is missing",
    credentials: { password: "ValidPassword123" },
    expectedError: API_ERRORS.VALIDATION_FAILED,
    expectedDetailFields: ["email"],
  },
  {
    caseId: "T007_Login_API",
    name: "rejects an email that does not match the email format",
    credentials: { email: "not-an-email", password: "ValidPassword123" },
    expectedError: API_ERRORS.VALIDATION_FAILED,
    expectedDetailFields: ["email"],
  },
] satisfies LoginScenario[];

const configuredEmailScenarios = [
  {
    caseId: "T003_Login_API",
    name: "rejects login when password is missing",
    credentials: {},
    expectedError: API_ERRORS.VALIDATION_FAILED,
    expectedDetailFields: ["password"],
  },
  {
    caseId: "T005_Login_API",
    name: "rejects an existing user's wrong password",
    credentials: {
      password: "IncorrectPassword123",
    },
    expectedError: API_ERRORS.INVALID_CREDENTIALS,
    expectedDetailFields: [],
  },
  {
    caseId: "T006_Login_API",
    name: "rejects a password below the six-character minimum",
    credentials: { password: "short" },
    expectedError: API_ERRORS.VALIDATION_FAILED,
    expectedDetailFields: ["password"],
  },
] satisfies ConfiguredEmailScenario[];

const unknownEmailCredentials: LoginRequestInput = {
  email: "unknown-user@example.invalid",
  password: "TestPassword123",
};

// unasserted: token, user.id (validated through the authenticated /auth/me response relationship)
// unasserted: user.iat, user.exp (integer types are schema-validated; no specific claim values are defined)
test.describe("Login API", () => {
  test("T001_Login_API: authenticates the configured user and returns a bearer token", async ({
    authApi,
  }) => {
    const credentials = getRoleCredentials("user");
    const loginCredentials: LoginRequestInput = {
      email: credentials.username,
      password: credentials.password,
    };
    const response = await authApi.login(loginCredentials);
    expect(response.status()).toBe(HTTP_STATUS.OK);

    const body: unknown = await response.json();
    validateSchema(loginResponseSchema, body);

    expect(body.success).toBe(true);
    expect(body.user.email).toBe(credentials.username);

    const meResponse = await authApi.me(body.token);
    expect(meResponse.status()).toBe(HTTP_STATUS.OK);

    const meBody: unknown = await meResponse.json();
    validateSchema(meResponseSchema, meBody);

    expect(meBody.success).toBe(true);
    expect(meBody.user.userId).toBe(body.user.id);
    expect(meBody.user.email).toBe(credentials.username);
  });

  for (const scenario of fixedCredentialScenarios) {
    test(`${scenario.caseId}: ${scenario.name}`, async ({ authApi }) => {
      const response = await authApi.login(scenario.credentials);
      expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);

      const body = await response.json();

      expect(body.error).toBe(scenario.expectedError);
      expect(body.details).toHaveLength(scenario.expectedDetailFields.length);
      expect(body.details[0]?.field).toBe(scenario.expectedDetailFields[0]);
    });
  }

  for (const scenario of configuredEmailScenarios) {
    // separate-test: these scenarios source email from the configured role account
    test(`${scenario.caseId}: ${scenario.name}`, async ({ authApi }) => {
      const credentials = getRoleCredentials("user");
      const loginCredentials: LoginRequestInput = {
        email: credentials.username,
        ...scenario.credentials,
      };
      const response = await authApi.login(loginCredentials);
      expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);

      const body = await response.json();

      expect(body.error).toBe(scenario.expectedError);
      expect(body.details).toHaveLength(scenario.expectedDetailFields.length);
      expect(body.details[0]?.field).toBe(scenario.expectedDetailFields[0]);
    });
  }

  test("T004_Login_API: rejects credentials for an unregistered email", async ({
    authApi,
  }) => {
    const response = await authApi.login(unknownEmailCredentials);
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
  });
});
