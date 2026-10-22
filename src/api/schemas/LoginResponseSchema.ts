import { Type, type Static } from "@sinclair/typebox";

export const loginResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    token: Type.String({ minLength: 1 }),
    user: Type.Object(
      {
        id: Type.Integer(),
        email: Type.String({ format: "email" }),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type LoginResponse = Static<typeof loginResponseSchema>;
