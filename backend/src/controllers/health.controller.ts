import type { Request, Response } from "express";
import { getHealth } from "../services/health.service";

const healthController = {
  getHealth: (_req: Request, res: Response) => {
    const data = getHealth();
    res.json({
      success: true,
      data,
    });
  },
};

export default healthController;
