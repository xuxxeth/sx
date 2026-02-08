import { Router } from "express";
import { pinJson } from "../controllers/ipfs";

const router = Router();

router.post("/pin-json", pinJson);

export default router;
