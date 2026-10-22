# demo-sdet-framework

Playwright tests created from the SDET framework template.

## Getting started

1. `npm run doctor`: checks the configuration and that the application is reachable.
2. Optional: register a dedicated test account in the application, then run `npm run onboard` to put it into `.env` (stage 2 of `./install.sh` offers the same step). You can skip this and fill in `.env` later.
3. Configure login: see [Configure login](#configure-login).
4. Put the accounts of any further roles into `.env` yourself (never into a prompt), then run `npm run doctor`, which signs in with them, and `npm run qa:sync-ci-secrets`.
5. Write the first tests: follow `AGENTS.md`, starting from the golden template for each file (`framework/templates/index.json`). Any AI tool in your IDE can follow `AGENTS.md`; see [Writing tests with AI tools](#writing-tests-with-ai-tools).
6. Register reviewed tests in `config/approved-examples.json`: they become the examples for the next tests.

## Configure login

Setup configures no login, because it depends on the application. Set it in `config/framework.config.ts`:

- `auth.api`: `{ strategy: "bearer", loginPath, usernameField, passwordField, tokenField }` when the API issues a bearer token from a login request, otherwise `{ strategy: "none" }`.
- `auth.browser`: `{ strategy: "nextAuth", csrfPath, callbackPath, landingPath, usernameField, passwordField }` for a NextAuth credentials login, otherwise `{ strategy: "none" }`.
- `roles`: one entry per role, naming its `.env` variables, such as `user: { usernameEnv: "USER_USERNAME", passwordEnv: "USER_PASSWORD" }` (`npm run onboard` adds the first one).

Take the paths and field names from the API contract or the login request the application sends. Then run `npm run doctor`: it signs in with every role and reports what fails.

## Structure

| Folder       | Owner        | Contents                                                                                                          |
| ------------ | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `framework/` | template     | `core/` (the framework, imported as `@framework/...`), `templates/`, `tools/`, `docs/`; change it in the template |
| `src/`       | this project | schemas, API clients, factories, Page Objects, components, mocks, fixtures (imported as `@app/...`)               |
| `tests/`     | this project | specs                                                                                                             |
| `config/`    | this project | `framework.config.ts`, environments, `approved-examples.json`                                                     |

Each folder under `src/` and `tests/` has a README naming what belongs there and its golden templates.

## Writing tests with AI tools

`AGENTS.md` holds the rules, and `.github/copilot-instructions.md` makes GitHub Copilot load it; `.vscode/mcp.json` adds the Playwright and OpenAPI MCP servers when the project has them. The checks in `AGENTS.md` and CI apply to every change, whoever wrote it.

Optional planner and builder agents for GitHub Copilot are in the template's `examples/copilot-agents/`; its README says how to copy them into `.github/agents/`.

## Commands

```bash
./install.sh                  # teammates: dependencies, .env, browsers, doctor, test account
npm run onboard               # test account into .env (optional; rerunnable)
npm run doctor                # configuration, reachability and login checks
npm run lint:architecture     # layer and import rules
npm run qa:sync-ci-secrets    # role and database secrets for GitHub Actions
```

## Running tests

Each enabled module and browser has its own script:

```bash
npx playwright test         # all enabled projects
npm run test:api            # --project=api
npm run test:accessibility  # --project=accessibility
npm run test:visual         # --project=visual
npm run test:ui             # tests/ui
npm run test:chromium       # --project=chromium
```

If you enable a module or browser later in `config/framework.config.ts`, add its script the same way.

Rules for people and AI tools: [AGENTS.md](AGENTS.md).
