import { Router } from "express";
import { healthDetails, readiness, summary } from "../controllers/health";

const router = Router();

router.get("/details", healthDetails);
router.get("/ready", readiness);
router.get("/summary", summary);

export default router;
