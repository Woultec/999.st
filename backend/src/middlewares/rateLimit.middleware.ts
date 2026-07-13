// ─── Rate Limit Middleware — Pigilan ang sobrang request ──
// 📌 RATE LIMITING — Parang guard sa pinto ng club:
//    "50 customers per 15 minutes lang, pag lumampas, wait ka!"
//    Iwas DDoS at sobrang bigat sa server

import rateLimit from "express-rate-limit";

/**
 * General API rate limit — para sa lahat ng routes
 * 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Max 100 requests per window
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,     // Ipakita ang rate limit info sa response headers
  legacyHeaders: false,      // Huwag gamitin ang lumang X-RateLimit headers
});

/**
 * Auth rate limit — para sa login/register
 * 10 attempts per 15 minutes (iwas brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Order rate limit — para sa paggawa ng order
 * 20 orders per 15 minutes (iwas spam)
 */
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many orders. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
