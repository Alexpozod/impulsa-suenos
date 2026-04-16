import pino from "pino";

const isProd = process.env.NODE_ENV === "production";

export const logger = isProd
  ? pino({
      level: "info",
    })
  : pino({
      level: "info",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
    });