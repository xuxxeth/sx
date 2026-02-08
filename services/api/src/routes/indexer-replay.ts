import { Router } from "express";
import { replayFromSignature } from "../controllers/indexer-replay";
import { requireIndexerKey } from "../services/auth";

const router = Router();

router.post("/replay", requireIndexerKey, replayFromSignature);

export default router;
