import { Type, type Static } from "@sinclair/typebox";

import { eventSchema } from "@app/api/schemas/EventSchema";

export const updateEventResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    data: eventSchema,
    message: Type.String(),
  },
  { additionalProperties: false },
);

export type UpdateEventResponse = Static<typeof updateEventResponseSchema>;
