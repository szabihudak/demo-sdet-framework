import { type APIRequestContext, type APIResponse } from "@playwright/test";

import type { CreateEventInput } from "@app/api/schemas/CreateEventInputSchema";
import { requireUrl } from "@framework/utils/env";

export type EventFilters = {
  category?: string;
  city?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export class EventApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async listEvents(
    filters: EventFilters = {},
    accessToken?: string,
  ): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");
    const headers = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined;

    return this.request.get(`${apiBaseUrl}events`, {
      headers,
      params: filters,
    });
  }

  async createEvent(
    event: Partial<CreateEventInput>,
    accessToken: string,
  ): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");

    return this.request.post(`${apiBaseUrl}events`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { ...event },
    });
  }

  async getEvent(eventId: number, accessToken: string): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");

    return this.request.get(`${apiBaseUrl}events/${eventId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  async updateEvent(
    eventId: number,
    event: Partial<CreateEventInput>,
    accessToken: string,
  ): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");

    return this.request.put(`${apiBaseUrl}events/${eventId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { ...event },
    });
  }

  async deleteEvent(
    eventId: number,
    accessToken: string,
  ): Promise<APIResponse> {
    const apiBaseUrl = requireUrl("apiBaseUrl");

    return this.request.delete(`${apiBaseUrl}events/${eventId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }
}
