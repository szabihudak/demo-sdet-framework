import { test, expect } from "@app/fixtures/test-fixtures";
import { createEvent } from "@app/data/eventFactory";

test.describe("Events page UI", () => {
  test("T014_Events_E2E: creates an event through the form and finds it in the event list", async ({
    adminEventsPage,
    eventsPage,
    eventTestData,
  }) => {
    const eventRequest = createEvent();
    await adminEventsPage.goto();
    await adminEventsPage.fillEvent(eventRequest);

    const createResponsePromise = adminEventsPage.page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith("/events"),
    );
    await adminEventsPage.submitEvent();
    const createResponse = await createResponsePromise;
    eventTestData.trackCreatedEvent(await createResponse.json());

    await eventsPage.goto();
    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    })
      .format(new Date(eventRequest.eventDate))
      .replace(/^(\w{3})\s+/, "$1, ");
    const eventCard = eventsPage.eventCardByTitle(eventRequest.title);
    const expectedCardDetails = `${eventRequest.category}${eventRequest.title}${formattedDate}${eventRequest.venue}, ${eventRequest.city}$${eventRequest.price}${eventRequest.totalSeats} seats available`;

    await expect(eventCard).toContainText(expectedCardDetails);
    await expect(eventsPage.eventImage(eventRequest.title)).toBeVisible();
    await expect(eventsPage.bookNowButton(eventRequest.title)).toBeVisible();
  });

  test("T016_Events_E2E: filters the event list by category", async ({
    eventTestData,
    eventsPage,
  }) => {
    const eventRequest = createEvent({ category: "Conference" });
    const createdEvent = await eventTestData.create(eventRequest);

    await eventsPage.goto();
    await eventsPage.filterByCategory(createdEvent.request.category);

    await expect(eventsPage.categoryFilter).toHaveValue(
      createdEvent.request.category,
    );
    await expect(
      eventsPage.eventTitle(createdEvent.request.title),
    ).toBeVisible();
  });
});
