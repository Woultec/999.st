import { Router } from "express";
import healthRouter from "./health.routes";
import userRouter from "./user.routes";
import productRouter from "./product.routes";
import authRouter from "./auth.routes";
import orderRouter from "./order.routes";
import setupRouter from "./setup.routes";

const router = Router();

router.use("/health", healthRouter);
router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/auth", authRouter);
router.use("/orders", orderRouter);
router.use("/setup", setupRouter);

export default router;
