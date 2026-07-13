import type { Request, Response } from "express";
import * as UserService from "../services/user.service";

const userController = {
  /** POST /api/users — Gumagawa ng bagong user */
  createUser: async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;

    // Simpleng validation
    if (!name || !email) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name and email are required",
      });
      return;
    }

    const newUser = await UserService.createUser(name, email);

    res.status(201).json({
      success: true,
      data: newUser,
    });
  },

  /** GET /api/users — Kunin ang lahat ng users */
  getUsers: async (_req: Request, res: Response): Promise<void> => {
    const users = await UserService.getUsers();
    res.json({
      success: true,
      data: users,
    });
  },

  /** GET /api/users/:id — Kunin ang isang user */
  getUserById: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const user = await UserService.getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `User with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  },

  /** PUT /api/users/:id — I-update ang user */
  updateUser: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    // Simpleng validation
    if (!name || !email) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name and email are required",
      });
      return;
    }

    const updatedUser = await UserService.updateUser(id, name, email);

    // Kung hindi mahanap ang user
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `User with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: updatedUser,
    });
  },

  /** DELETE /api/users/:id — Burahin ang user */
  deleteUser: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    const deletedUser = await UserService.deleteUser(id);

    // Kung hindi mahanap ang user
    if (!deletedUser) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `User with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: deletedUser,
    });
  },
};

export default userController;
