import { type APIRequestContext, type APIResponse } from "@playwright/test";

import type { LoginRequest } from "@app/api/schemas/LoginRequestSchema";
import { requireUrl } from "@framework/utils/env";

export class AuthApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async login(credentials: Partial<LoginRequest>): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");

    return this.request.post(`${apiBaseUrl}auth/login`, {
      data: { ...credentials },
    });
  }

  async me(accessToken: string): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");

    return this.request.get(`${apiBaseUrl}auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
