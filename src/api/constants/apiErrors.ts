export const API_ERRORS = {
  VALIDATION_FAILED: "Validation failed",
  INVALID_CREDENTIALS: "Invalid email or password",
} as const;

export type ApiError = (typeof API_ERRORS)[keyof typeof API_ERRORS];
