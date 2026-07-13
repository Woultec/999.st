import { Router } from "express";
import productController from "../controllers/product.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Public routes — kahit sino pwede tumingin
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);

// Protected routes — admin lang pwedeng mag-post, mag-update, mag-delete
router.post("/", authenticate, requireAdmin, productController.createProduct);
router.put("/:id", authenticate, requireAdmin, productController.updateProduct);
router.delete("/:id", authenticate, requireAdmin, productController.deleteProduct);

export default router;
