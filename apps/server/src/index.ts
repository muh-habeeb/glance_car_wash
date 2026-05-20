import { createContext } from "@glance_car_wash/api/context";
import { appRouter } from "@glance_car_wash/api/routers/index";
import { env } from "@glance_car_wash/env/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(env.PORT, () => {
  console.log(`Server is running on http://localhost:${env.PORT}`);
});
