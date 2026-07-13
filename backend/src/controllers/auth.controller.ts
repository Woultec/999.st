// ─── Auth Controller — Register at Login Handlers ─────────
import type { Request, Response } from "express";
import * as AuthService from "../services/auth.service";
import prisma from "../prisma/client";

const authController = {
  /** POST /api/auth/register — Magrehistro bilang buyer */
  register: async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name, email, and password are required",
      });
      return;
    }

    // Password dapat hindi bababa sa 6 characters
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Password must be at least 6 characters",
      });
      return;
    }

    const result = await AuthService.registerBuyer(name, email, password);

    // Kung may error (e.g., duplicate email)
    if ("error" in result) {
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: result.error,
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: result,
    });
  },

  /** POST /api/auth/login — Mag-login (admin o buyer) */
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email and password are required",
      });
      return;
    }

    const result = await AuthService.login(email, password);

    // Kung mali ang credentials
    if ("error" in result) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: result.error,
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  },

  /** GET /api/auth/me — Kunin ang current user (protected) */
  getMe: async (req: Request, res: Response): Promise<void> => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  },

  /** PUT /api/auth/profile — I-update ang profile (name, email) */
  updateProfile: async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;
    const userId = req.user!.id;

    if (!name || !email) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name and email are required",
      });
      return;
    }

    const result = await AuthService.updateProfile(userId, name, email);

    if ("error" in result) {
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: result.error,
      });
      return;
    }

    res.json({
      success: true,
      data: result.user,
    });
  },

  /** PUT /api/auth/password — Palitan ang password */
  changePassword: async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Current password and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "New password must be at least 6 characters",
      });
      return;
    }

    const result = await AuthService.changePassword(userId, currentPassword, newPassword);

    if ("error" in result) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: result.error,
      });
      return;
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  },
};

export default authController;
