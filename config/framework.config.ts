import { defineFrameworkConfig } from "../framework/core/config/frameworkConfigSchema";

export default defineFrameworkConfig({
  modules: {
    api: true,
    ui: true,
    smoke: false,
    accessibility: true,
    database: false,
    visual: true,
    performance: false,
  },
  browsers: ["chromium"],
  execution: { ciRetries: 2, ciWorkers: "50%" },
  auth: {
    api: {
      strategy: "bearer",
      loginPath: "auth/login",
      usernameField: "email",
      passwordField: "password",
      tokenField: "token",
    },
    browser: { strategy: "none" },
  },
  roles: {
    user: { usernameEnv: "USER_USERNAME", passwordEnv: "USER_PASSWORD" },
  },
});
