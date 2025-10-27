import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errors.middlewares.js";

const app = express();

app.use(
  cors({
    origin: process.env.CROSS_ORIGIN,
    credential: true,
  })
);
app.use(cookieParser());

app.use(express.json({ limit: "16kb" }));
app.use(
  express.urlencoded({
    limit: "16kb",
    credential: true,
  })
);
app.use(express.static("public"));

import healthcheckRouter from "./routes/healthcheck.routes.js";
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/healthcheck", healthcheckRouter);

app.use("/api/v1/users/", userRouter);

app.use(errorHandler);

export { app };
