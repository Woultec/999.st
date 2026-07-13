import express from "express";
import cors from "cors";

import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";
import { generalLimiter, authLimiter, orderLimiter } from "./middlewares/rateLimit.middleware";

const app = express();

// ─── Global Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────
app.use("/api", generalLimiter);         // Lahat ng API: 100 req/15min

// ─── Routes ──────────────────────────────────────────
app.use("/api", routes);

// ─── Apply specific rate limiters per route ──────────
// 📌 Ang specific limiter ay nilalagay SA mismong route file
//    Tingnan ang auth.routes.ts at order.routes.ts

// ─── Error Handlers ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;