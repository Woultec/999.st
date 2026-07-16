import express from "express";
import cors from "cors";

import routes from "./routes";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware";
import { generalLimiter } from "./middlewares/rateLimit.middleware";

const app = express();

// ─── Webhook Middleware — Kailangan ng RAW body para ma-verify ang webhook ──
// ⚠️ DAPAT nasa UNAHAN ng express.json() para makuha ang raw body!
app.use("/api/payments/webhook", (req: any, _res: any, next: any) => {
  let data = "";
  req.on("data", (chunk: string) => {
    data += chunk;
  });
  req.on("end", () => {
    req.rawBody = data; // I-save ang raw body para sa signature verification
    try {
      req.body = JSON.parse(data); // I-parse bilang JSON
    } catch {
      req.body = {};
    }
    next();
  });
});

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