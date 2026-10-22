import { Type, type Static } from "@sinclair/typebox";

import { eventSchema } from "@app/api/schemas/EventSchema";

const paginationMetaSchema = Type.Object(
  {
    total: Type.Integer(),
    page: Type.Integer(),
    limit: Type.Integer(),
    totalPages: Type.Integer(),
  },
  { additionalProperties: false },
);

export const eventsListResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    data: Type.Array(eventSchema),
    pagination: paginationMetaSchema,
  },
  { additionalProperties: false },
);

export type EventsListResponse = Static<typeof eventsListResponseSchema>;
