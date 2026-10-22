import {
  test as frameworkTest,
  expect,
} from "@framework/fixtures/framework-fixtures";
import { AuthApiClient } from "@app/api/clients/AuthApiClient";
import { EventApiClient } from "@app/api/clients/EventApiClient";
import { HomePage } from "@app/pages/HomePage";
import { LoginPage } from "@app/pages/LoginPage";
import type { CreateEventInput } from "@app/api/schemas/CreateEventInputSchema";
import type { CreateEventResponse } from "@app/api/schemas/CreateEventResponseSchema";
import type { Event } from "@app/api/schemas/EventSchema";
import { createEventResponseSchema } from "@app/api/schemas/CreateEventResponseSchema";
import { createEvent } from "@app/data/eventFactory";
import { validateSchema } from "@framework/api/SchemaValidator";

// Add application fixtures here (API clients, Page Objects, test data).
// See the fixture section of framework/docs/TESTING_STANDARDS.md and framework/templates/index.json.
type AppFixtures = {
  authApi: AuthApiClient;
  eventApi: EventApiClient;
  eventTestData: {
    accessToken: string;
    trackCreatedEvent: (responseBody: unknown) => number;
    create: (request?: CreateEventInput) => Promise<{
      request: CreateEventInput;
      response: Event;
      message: CreateEventResponse["message"];
    }>;
  };
  homePage: HomePage;
  loginPage: LoginPage;
};

export const test = frameworkTest.extend<AppFixtures>({
  authApi: async ({ request }, use) => {
    await use(new AuthApiClient(request));
  },
  eventApi: async ({ request }, use) => {
    await use(new EventApiClient(request));
  },
  eventTestData: async ({ eventApi, apiTokenFor }, use) => {
    const accessToken = await apiTokenFor("user");
    const createdIds: number[] = [];
    const trackCreatedEvent = (responseBody: unknown): number => {
      if (
        typeof responseBody !== "object" ||
        responseBody === null ||
        !("data" in responseBody) ||
        typeof responseBody.data !== "object" ||
        responseBody.data === null ||
        !("id" in responseBody.data) ||
        typeof responseBody.data.id !== "number"
      ) {
        throw new Error(
          "Event response has no numeric event ID to register for cleanup.",
        );
      }

      createdIds.push(responseBody.data.id);
      return responseBody.data.id;
    };
    const createdEvents = {
      accessToken,
      trackCreatedEvent,
      create: async (request = createEvent()) => {
        const createResponse = await eventApi.createEvent(request, accessToken);

        if (!createResponse.ok()) {
          throw new Error(
            `Event setup failed: ${createResponse.status()} ${await createResponse.text()}`,
          );
        }

        const createdEventBody: unknown = await createResponse.json();
        trackCreatedEvent(createdEventBody);
        validateSchema(createEventResponseSchema, createdEventBody);

        return {
          request,
          response: createdEventBody.data,
          message: createdEventBody.message,
        };
      },
    };

    await use(createdEvents);

    for (const eventId of createdIds) {
      const currentEvent = await eventApi.getEvent(eventId, accessToken);
      if (currentEvent.status() === 404) continue;
      if (!currentEvent.ok()) {
        throw new Error(
          `Event cleanup check failed: ${currentEvent.status()} ${await currentEvent.text()}`,
        );
      }

      const deleteResponse = await eventApi.deleteEvent(eventId, accessToken);
      if (!deleteResponse.ok()) {
        throw new Error(
          `Event cleanup failed: ${deleteResponse.status()} ${await deleteResponse.text()}`,
        );
      }
    }
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect };
