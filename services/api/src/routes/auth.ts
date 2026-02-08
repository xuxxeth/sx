import { Router } from "express";
import { requestChallenge, verifyChallenge } from "../controllers/auth";

const router = Router();

router.post("/challenge", requestChallenge);
router.post("/verify", verifyChallenge);

export default router;
