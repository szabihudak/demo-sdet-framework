import { Type, type Static } from "@sinclair/typebox";

export const deleteEventResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    message: Type.String(),
  },
  { additionalProperties: false },
);

export type DeleteEventResponse = Static<typeof deleteEventResponseSchema>;
