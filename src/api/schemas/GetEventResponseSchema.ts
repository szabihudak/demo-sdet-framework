import { Type, type Static } from "@sinclair/typebox";

import { eventSchema } from "@app/api/schemas/EventSchema";

export const getEventResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    data: eventSchema,
  },
  { additionalProperties: false },
);

export type GetEventResponse = Static<typeof getEventResponseSchema>;
