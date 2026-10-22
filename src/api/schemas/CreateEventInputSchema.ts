import { Type, type Static } from "@sinclair/typebox";

export const createEventInputSchema = Type.Object(
  {
    title: Type.String(),
    description: Type.Optional(Type.String()),
    category: Type.String(),
    venue: Type.String(),
    city: Type.String(),
    eventDate: Type.String({ format: "date-time" }),
    price: Type.Number(),
    totalSeats: Type.Integer(),
    imageUrl: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export type CreateEventInput = Static<typeof createEventInputSchema>;
