import { Router } from "express";
import { listTopics, getTopicFeed } from "../controllers/topics";

const router = Router();

router.get("/", listTopics);
router.get("/:topic", getTopicFeed);

export default router;
