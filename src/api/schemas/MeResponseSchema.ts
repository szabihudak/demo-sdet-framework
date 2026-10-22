import { Type, type Static } from "@sinclair/typebox";

export const meResponseSchema = Type.Object(
  {
    success: Type.Literal(true),
    user: Type.Object(
      {
        userId: Type.Integer(),
        email: Type.String({ format: "email" }),
        iat: Type.Integer(),
        exp: Type.Integer(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export type MeResponse = Static<typeof meResponseSchema>;
