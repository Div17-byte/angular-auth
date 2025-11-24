import express, { Response, Request } from "express";
import { authenticate } from "../middleware/authenticate";

const router = express.Router();

const protectedHandler = (req: Request, res: Response): void => {
  // After authenticate middleware runs, req.user should be set
  res.json({ ok: true, user: (req as any).user, message: "This is protected data" });
};

router.get("/", authenticate as any, protectedHandler);

export default router;
