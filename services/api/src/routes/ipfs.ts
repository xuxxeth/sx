import { Router } from "express";
import multer from "multer";
import { pinJson, pinFile } from "../controllers/ipfs";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/pin-json", pinJson);
router.post("/pin-file", upload.single("file"), pinFile);

export default router;
