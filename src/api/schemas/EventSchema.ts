import { Type, type Static } from "@sinclair/typebox";

export const eventSchema = Type.Object(
  {
    id: Type.Integer(),
    title: Type.String(),
    description: Type.String(),
    category: Type.String(),
    venue: Type.String(),
    city: Type.String(),
    eventDate: Type.String({ format: "date-time" }),
    price: Type.String(),
    totalSeats: Type.Integer(),
    availableSeats: Type.Integer(),
    imageUrl: Type.Union([Type.String(), Type.Null()]),
    // running application, not in the contract (finding)
    isStatic: Type.Boolean(),
    // running application, not in the contract (finding)
    userId: Type.Union([Type.Integer(), Type.Null()]),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  { additionalProperties: false },
);

export type Event = Static<typeof eventSchema>;
