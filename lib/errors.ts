export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "DUPLICATE_AIMS"
  | "INVALID_MAJLIS"
  | "TOKEN_NOT_FOUND"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_TOKEN"
  | "INVALID_URL"
  | "PARSE_FAILED"
  | "FUTURE_DATE"
  | "DUPLICATE_ACTIVITY"
  | "EVENT_INACTIVE"
  | "OUTSIDE_EVENT_PERIOD"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: unknown;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

export function duplicateAimsMessage(noAims: string): string {
  return `No. AIMS ${noAims} sudah terdaftar. Jika Anda sudah memiliki token, gunakan menu Input Aktivitas. Jika lupa token, gunakan menu Lupa Token.`;
}
