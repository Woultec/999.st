// ─── PaymentSetting Controller — E-wallet Management ─────
// 📌 Admin: CRUD operations for e-wallet accounts
//    Public: GET active e-wallets for checkout

import type { Request, Response } from "express";
import * as PaymentSettingService from "../services/paymentSetting.service";

const paymentSettingController = {
  /** GET /api/payment-settings — Public: kunin ang active e-wallets */
  getActive: async (_req: Request, res: Response): Promise<void> => {
    try {
      const settings = await PaymentSettingService.getActiveSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch payment settings",
      });
    }
  },

  /** GET /api/payment-settings/admin — Admin: kunin lahat */
  getAll: async (_req: Request, res: Response): Promise<void> => {
    try {
      const settings = await PaymentSettingService.getAllSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch payment settings",
      });
    }
  },

  /** POST /api/payment-settings — Admin: gumawa ng bagong e-wallet */
  create: async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, number, icon, isActive } = req.body;

      if (!name || !number) {
        res.status(400).json({
          success: false,
          message: "Name and number are required",
        });
        return;
      }

      const setting = await PaymentSettingService.createSetting({
        name,
        number,
        icon,
        isActive,
      });

      res.status(201).json({ success: true, data: setting });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create payment setting",
      });
    }
  },

  /** PUT /api/payment-settings/:id — Admin: i-update ang e-wallet */
  update: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const { name, number, icon, isActive } = req.body;

      const setting = await PaymentSettingService.updateSetting(id, {
        name,
        number,
        icon,
        isActive,
      });

      res.json({ success: true, data: setting });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update payment setting",
      });
    }
  },

  /** DELETE /api/payment-settings/:id — Admin: burahin ang e-wallet */
  delete: async (req: Request, res: Response): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await PaymentSettingService.deleteSetting(id);
      res.json({ success: true, message: "Payment setting deleted" });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete payment setting",
      });
    }
  },
};

export default paymentSettingController;
