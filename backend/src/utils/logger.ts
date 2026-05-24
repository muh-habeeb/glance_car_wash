import pino from "pino";
import { env } from "../config/env.js";

// Paths to redact from logs (to prevent logging sensitive info)
const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "req.body.password",
  "req.body.token",
  "res.headers['set-cookie']",
];

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  redact: {
    paths: redactPaths,
    censor: "[REDACTED]",
  },
  ...(env.NODE_ENV !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

export default logger;
