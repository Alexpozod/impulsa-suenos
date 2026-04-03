import { logger } from "./logger";

export function logInfo(message: string, data?: any) {
  logger.info({
    message,
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export function logError(message: string, error?: any) {
  logger.error({
    message,
    error,
    timestamp: new Date().toISOString(),
  });
}