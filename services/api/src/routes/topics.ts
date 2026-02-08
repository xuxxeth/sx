import { Router } from "express";
import { listTopics, getTopicFeed, createTopic } from "../controllers/topics";
import { requireAuth } from "../services/auth";

const router = Router();

router.get("/", listTopics);
router.get("/:topic", getTopicFeed);

router.post("/", requireAuth, createTopic);

export default router;
