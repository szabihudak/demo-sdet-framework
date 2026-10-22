import { randomUUID } from "node:crypto";

import type { CreateEventInput } from "@app/api/schemas/CreateEventInputSchema";

export type CreateEventOptions = Partial<CreateEventInput>;

export function createEvent(
  options: CreateEventOptions = {},
): CreateEventInput {
  const uniqueId = randomUUID();
  const eventDate = new Date(
    Date.now() + 180 * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    title: options.title ?? `Framework event ${uniqueId}`,
    description: options.description ?? `Test-owned event ${uniqueId}`,
    category: options.category ?? "Conference",
    venue: options.venue ?? `Test venue ${uniqueId}`,
    city: options.city ?? `Test city ${uniqueId}`,
    eventDate: options.eventDate ?? eventDate,
    price: options.price ?? 25,
    totalSeats: options.totalSeats ?? 30,
    imageUrl: options.imageUrl ?? `https://example.com/events/${uniqueId}.jpg`,
  };
}

export function createEventPayload(
  options: CreateEventOptions = {},
  missingFields: (keyof CreateEventInput)[] = [],
): Partial<CreateEventInput> {
  const payload: Partial<CreateEventInput> = createEvent(options);

  for (const field of missingFields) {
    delete payload[field];
  }

  return payload;
}
