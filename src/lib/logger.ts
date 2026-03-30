import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true },
      }
    : undefined,
});

export function logAudit(
  level: "info" | "warn" | "error",
  action: string,
  meta?: Record<string, unknown>,
  userId?: string | null
) {
  const payload = { action, userId, ...meta };
  if (level === "error") logger.error(payload);
  else if (level === "warn") logger.warn(payload);
  else logger.info(payload);
}
