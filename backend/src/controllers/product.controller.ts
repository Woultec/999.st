import type { Request, Response } from "express";
import * as ProductService from "../services/product.service";

const productController = {
  /** POST /api/products — Gumagawa ng bagong product */
  createProduct: async (req: Request, res: Response): Promise<void> => {
    const { name, description, price, imageUrl } = req.body;

    // Simpleng validation
    if (!name || !description || price === undefined) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name, description, and price are required",
      });
      return;
    }

    if (typeof price !== "number" || price <= 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Price must be a positive number",
      });
      return;
    }

    const userId = req.user!.id;

    const newProduct = await ProductService.createProduct(name, description, price, userId, imageUrl);

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  },

  /** GET /api/products — Kunin ang lahat ng products */
  getProducts: async (_req: Request, res: Response): Promise<void> => {
    const products = await ProductService.getProducts();
    res.json({
      success: true,
      data: products,
    });
  },

  /** GET /api/products/:id — Kunin ang isang product */
  getProductById: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    const product = await ProductService.getProductById(id);

    if (!product) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Product with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: product,
    });
  },

  /** PUT /api/products/:id — I-update ang product */
  updateProduct: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { name, description, price, imageUrl } = req.body;

    // Simpleng validation
    if (!name || !description || price === undefined) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Name, description, and price are required",
      });
      return;
    }

    if (typeof price !== "number" || price <= 0) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Price must be a positive number",
      });
      return;
    }

    const updatedProduct = await ProductService.updateProduct(id, name, description, price, imageUrl);

    if (!updatedProduct) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Product with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: updatedProduct,
    });
  },

  /** DELETE /api/products/:id — Burahin ang product */
  deleteProduct: async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);

    const deletedProduct = await ProductService.deleteProduct(id);

    if (!deletedProduct) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: `Product with ID ${id} not found`,
      });
      return;
    }

    res.json({
      success: true,
      data: deletedProduct,
    });
  },
};

export default productController;
