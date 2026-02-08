import { Router } from "express";
import { createTip, listTipsByRecipient } from "../controllers/tips";
import { requireAuth } from "../services/auth";

const router = Router();

router.post("/", requireAuth, createTip);
router.get("/:to", listTipsByRecipient);

export default router;
