import { Router } from "express";
import { indexFollows, indexPosts, indexProfiles, indexTips } from "../controllers/indexer";
import { requireIndexerKey } from "../services/auth";

const router = Router();

router.post("/profiles", requireIndexerKey, indexProfiles);
router.post("/follows", requireIndexerKey, indexFollows);
router.post("/posts", requireIndexerKey, indexPosts);
router.post("/tips", requireIndexerKey, indexTips);

export default router;
