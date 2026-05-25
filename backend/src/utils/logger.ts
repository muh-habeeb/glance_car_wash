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
  transport: {
    targets: [
      // 1. Terminal Output (Basic, Clean, No massive stack traces)
      {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          // We ignore these massive object properties so they don't dump onto the terminal
          ignore: "pid,hostname,req,res,err,responseTime,ip,userId,endpoint,method",
        },
        level: env.NODE_ENV === "production" ? "info" : "debug",
      },
      // 2. File Output (Full raw JSON logs, keeps all request data and stack traces)
      {
        target: "pino/file",
        options: {
          destination: "./logs/app.log", // Creates a logs folder automatically
          mkdir: true,
        },
        level: "info",
      },
    ],
  },
});

export default logger;
