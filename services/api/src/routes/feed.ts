import { Router } from "express";
import {
  getFollowingFeed,
  getFollowingFeedByQuery,
  getProfileFeed,
  getProfileSummary,
  getPublicFeed,
} from "../controllers/feed";

const router = Router();

router.get("/public", getPublicFeed);
router.get("/following", getFollowingFeedByQuery);
router.get("/:authority/summary", getProfileSummary);
router.get("/:authority/following", getFollowingFeed);
router.get("/:authority/profile", getProfileFeed);

export default router;
