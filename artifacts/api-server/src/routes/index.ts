import { Router, type IRouter } from "express";
import healthRouter from "./health";
import aiRouter from "./ai";

const router: IRouter = Router();

router.get("/", (req, res) => {
  res.json({
    message: "API running",
    endpoints: ["/health", "/ai"]
  });
});

// ✅ FIX: mount with prefixes
router.use("/health", healthRouter);
router.use("/ai", aiRouter);

export default router;