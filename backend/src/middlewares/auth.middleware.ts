// ─── Auth Middleware — JWT Verification + Role Check ──────
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../services/auth.service";

// ─── Type Definition ──────────────────────────────────────
export interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// I-extend ang Express Request para magkaroon ng `user` property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── Authenticate — Siguraduhing may valid JWT token ──────
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  // Dapat may "Bearer <token>" sa Authorization header
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access denied. No token provided.",
    });
    return;
  }

  const token = header.split(" ")[1] as string;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired token.",
    });
  }
};

// ─── Require Admin — Admin lang ang pwedeng pumasok ──────
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    res.status(403).json({
      success: false,
      statusCode: 403,
      message: "Access denied. Admin only.",
    });
    return;
  }

  next();
};
