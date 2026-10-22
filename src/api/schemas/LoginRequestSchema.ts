import { Type, type Static } from "@sinclair/typebox";

export const loginRequestSchema = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 6 }),
  },
  { additionalProperties: false },
);

export type LoginRequest = Static<typeof loginRequestSchema>;
export type LoginRequestInput = Partial<LoginRequest>;
