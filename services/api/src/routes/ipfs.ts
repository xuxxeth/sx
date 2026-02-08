import { Router } from "express";
import multer from "multer";
import { pinJson, pinFile } from "../controllers/ipfs";
import { requireAuth } from "../services/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/pin-json", requireAuth, pinJson);
router.post("/pin-file", requireAuth, upload.single("file"), pinFile);

export default router;
