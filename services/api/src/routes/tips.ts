import { Router } from "express";
import { createTip, listTipsByRecipient } from "../controllers/tips";

const router = Router();

router.post("/", createTip);
router.get("/:to", listTipsByRecipient);

export default router;
