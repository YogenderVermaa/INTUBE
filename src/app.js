import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

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

app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
