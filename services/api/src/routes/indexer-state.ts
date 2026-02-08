import { Router } from "express";
import { getState } from "../controllers/indexer-state";

const router = Router();

router.get("/state", getState);

export default router;
