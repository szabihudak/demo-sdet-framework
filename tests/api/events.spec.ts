import { randomInt } from "node:crypto";

import { test, expect } from "@app/fixtures/test-fixtures";
import {
  type EventApiClient,
  type EventFilters,
} from "@app/api/clients/EventApiClient";
import { createEvent, createEventPayload } from "@app/data/eventFactory";
import type { CreateEventInput } from "@app/api/schemas/CreateEventInputSchema";
import { createEventResponseSchema } from "@app/api/schemas/CreateEventResponseSchema";
import { deleteEventResponseSchema } from "@app/api/schemas/DeleteEventResponseSchema";
import { eventsListResponseSchema } from "@app/api/schemas/EventsListResponseSchema";
import { getEventResponseSchema } from "@app/api/schemas/GetEventResponseSchema";
import { updateEventResponseSchema } from "@app/api/schemas/UpdateEventResponseSchema";
import { HTTP_STATUS } from "@framework/api/httpStatuses";
import { validateSchema } from "@framework/api/SchemaValidator";

type EventFilterScenario = {
  caseId: string;
  name: string;
  expectedField: "category" | "city" | "title";
  filters: (event: CreateEventInput) => {
    filters: EventFilters;
    expectedValue: string;
  };
};

const eventFilterScenarios = [
  {
    caseId: "T006_Events_API",
    name: "filters events by category",
    expectedField: "category",
    filters: () => ({
      filters: { category: "Conference" },
      expectedValue: "Conference",
    }),
  },
  {
    caseId: "T007_Events_API",
    name: "filters events by city",
    expectedField: "city",
    filters: (event) => ({
      filters: { city: event.city },
      expectedValue: event.city,
    }),
  },
  {
    caseId: "T008_Events_API",
    name: "searches event title using free-text search",
    expectedField: "title",
    filters: (event) => ({
      filters: { search: event.title },
      expectedValue: event.title,
    }),
  },
] satisfies EventFilterScenario[];

const paginationScenarios = [
  {
    caseId: "T009_Events_API",
    name: "returns the requested page and limit",
    filters: { page: 2, limit: 1 },
    expectedPage: 2,
    expectedLimit: 1,
  },
] satisfies {
  caseId: string;
  name: string;
  filters: EventFilters;
  expectedPage: number;
  expectedLimit: number;
}[];

function createUnknownEventId(): number {
  return randomInt(1_000_000_000, 2_000_000_000);
}

// unasserted: data, pagination.total, pagination.totalPages (shared staging inventory is variable; focused cases assert owned event values)
test.describe("Events API", () => {
  test("T001_Events_API: lists events with default pagination", async ({
    eventApi,
    apiTokenFor,
  }) => {
    const accessToken = await apiTokenFor("user");
    const response = await eventApi.listEvents({}, accessToken);
    expect(response.status()).toBe(HTTP_STATUS.OK);

    const body: unknown = await response.json();
    validateSchema(eventsListResponseSchema, body);

    expect(body.success).toBe(true);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
  });

  test("T002_Events_API: creates an event with valid required and optional fields", async ({
    eventTestData,
  }) => {
    const createdEvent = await eventTestData.create();

    expect(createdEvent.message).toBe("Event created successfully");
    expect(createdEvent.response.id).toEqual(expect.any(Number));
    expect(createdEvent.response.title).toBe(createdEvent.request.title);
    expect(createdEvent.response.description).toBe(
      createdEvent.request.description,
    );
    expect(createdEvent.response.category).toBe(createdEvent.request.category);
    expect(createdEvent.response.venue).toBe(createdEvent.request.venue);
    expect(createdEvent.response.city).toBe(createdEvent.request.city);
    expect(createdEvent.response.eventDate).toBe(
      createdEvent.request.eventDate,
    );
    expect(createdEvent.response.price).toBe(
      String(createdEvent.request.price),
    );
    expect(createdEvent.response.totalSeats).toBe(
      createdEvent.request.totalSeats,
    );
    expect(createdEvent.response.availableSeats).toBe(
      createdEvent.request.totalSeats,
    );
    expect(createdEvent.response.imageUrl).toBe(createdEvent.request.imageUrl);
  });

  test("T003_Events_API: retrieves a created event by its ID", async ({
    eventTestData,
    eventApi,
  }) => {
    const createdEvent = await eventTestData.create();
    const response = await eventApi.getEvent(
      createdEvent.response.id,
      eventTestData.accessToken,
    );
    expect(response.status()).toBe(HTTP_STATUS.OK);

    const body: unknown = await response.json();
    validateSchema(getEventResponseSchema, body);

    expect(body.success).toBe(true);
    expect(body.data).toEqual(createdEvent.response);
  });

  test("T004_Events_API: updates an event using the complete update body", async ({
    eventTestData,
    eventApi,
  }) => {
    const createdEvent = await eventTestData.create();
    const updateRequest = createEvent({
      ...createdEvent.request,
      title: `Updated ${createdEvent.request.title}`,
    });
    const response = await eventApi.updateEvent(
      createdEvent.response.id,
      updateRequest,
      eventTestData.accessToken,
    );
    expect(response.status()).toBe(HTTP_STATUS.OK);

    const body: unknown = await response.json();
    validateSchema(updateEventResponseSchema, body);

    expect(body.success).toBe(true);
    expect(body.message).toBe("Event updated successfully");
    expect(body.data.id).toBe(createdEvent.response.id);
    expect(body.data.title).toBe(updateRequest.title);
    expect(body.data.description).toBe(updateRequest.description);
    expect(body.data.category).toBe(updateRequest.category);
    expect(body.data.venue).toBe(updateRequest.venue);
    expect(body.data.city).toBe(updateRequest.city);
    expect(body.data.eventDate).toBe(updateRequest.eventDate);
    expect(body.data.price).toBe(String(updateRequest.price));
    expect(body.data.totalSeats).toBe(updateRequest.totalSeats);
    expect(body.data.imageUrl).toBe(updateRequest.imageUrl);
  });

  // separate-test: verifies the provider's explicitly public route contract without authentication
  test("T005_Events_API: allows the contract-public event list without a token", async ({
    eventApi,
  }) => {
    const response = await eventApi.listEvents();
    expect(response.status()).toBe(HTTP_STATUS.OK);

    const body: unknown = await response.json();
    validateSchema(eventsListResponseSchema, body);

    expect(body.success).toBe(true);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(10);
  });

  for (const scenario of eventFilterScenarios) {
    test(`${scenario.caseId}: ${scenario.name}`, async ({
      eventTestData,
      eventApi,
    }) => {
      const createdEvent = await eventTestData.create();
      const { filters, expectedValue } = scenario.filters(createdEvent.request);

      const response = await eventApi.listEvents(
        filters,
        eventTestData.accessToken,
      );
      expect(response.status()).toBe(HTTP_STATUS.OK);

      const body: unknown = await response.json();
      validateSchema(eventsListResponseSchema, body);

      expect(body.success).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
      for (const event of body.data) {
        if (scenario.expectedField === "title") {
          expect(event.title).toContain(expectedValue);
        } else {
          expect(event[scenario.expectedField]).toBe(expectedValue);
        }
      }
    });
  }

  for (const scenario of paginationScenarios) {
    test(`${scenario.caseId}: ${scenario.name}`, async ({
      eventApi,
      apiTokenFor,
    }) => {
      const accessToken = await apiTokenFor("user");
      const response = await eventApi.listEvents(scenario.filters, accessToken);
      expect(response.status()).toBe(HTTP_STATUS.OK);

      const body: unknown = await response.json();
      validateSchema(eventsListResponseSchema, body);

      expect(body.success).toBe(true);
      expect(body.pagination.page).toBe(scenario.expectedPage);
      expect(body.pagination.limit).toBe(scenario.expectedLimit);
      expect(body.data.length).toBeLessThanOrEqual(scenario.expectedLimit);
    });
  }

  test("T010_Events_API: returns not found for an unknown event ID", async ({
    eventApi,
    apiTokenFor,
  }) => {
    const accessToken = await apiTokenFor("user");
    const response = await eventApi.getEvent(
      createUnknownEventId(),
      accessToken,
    );
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
  });

  test("T011_Events_API: returns not found when updating an unknown event ID", async ({
    eventApi,
    apiTokenFor,
  }) => {
    const accessToken = await apiTokenFor("user");
    const updateRequest = createEvent();
    const response = await eventApi.updateEvent(
      createUnknownEventId(),
      updateRequest,
      accessToken,
    );
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
  });

  test("T012_Events_API: returns not found when deleting an unknown event ID", async ({
    eventApi,
    apiTokenFor,
  }) => {
    const accessToken = await apiTokenFor("user");
    const response = await eventApi.deleteEvent(
      createUnknownEventId(),
      accessToken,
    );
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);

    const body = await response.json();
    expect(body.error).toEqual(expect.any(String));
  });

  test("T013_Events_API: rejects event creation when required title is missing", async ({
    eventApi,
    apiTokenFor,
  }) => {
    const accessToken = await apiTokenFor("user");
    const eventPayload = createEventPayload({}, ["title"]);
    const response = await eventApi.createEvent(eventPayload, accessToken);
    expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);

    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details[0]?.field).toBe("title");
  });

  test("T015_Events_API: rejects update when required title is missing", async ({
    eventTestData,
    eventApi,
  }) => {
    const createdEvent = await eventTestData.create();
    const updatePayload = createEventPayload(createdEvent.request, ["title"]);
    const response = await eventApi.updateEvent(
      createdEvent.response.id,
      updatePayload,
      eventTestData.accessToken,
    );
    expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);

    const body = await response.json();
    expect(body.error).toBe("Validation failed");
    expect(body.details[0]?.field).toBe("title");
  });

  test("T017_Events_API: deletes a test-owned event and confirms it is no longer retrievable", async ({
    eventTestData,
    eventApi,
  }) => {
    const createdEvent = await eventTestData.create();
    await deleteEventAndAssertSuccess(
      eventApi,
      createdEvent.response.id,
      eventTestData.accessToken,
    );

    const getResponse = await eventApi.getEvent(
      createdEvent.response.id,
      eventTestData.accessToken,
    );
    expect(getResponse.status()).toBe(HTTP_STATUS.NOT_FOUND);
  });
});

async function deleteEventAndAssertSuccess(
  eventApi: EventApiClient,
  eventId: number,
  accessToken: string,
): Promise<void> {
  const response = await eventApi.deleteEvent(eventId, accessToken);
  expect(response.status()).toBe(HTTP_STATUS.OK);

  const body: unknown = await response.json();
  validateSchema(deleteEventResponseSchema, body);

  expect(body.success).toBe(true);
  expect(body.message).toBe("Event deleted successfully");
}
