import { Router } from "express";
import {
  follow,
  listFollowers,
  listFollowing,
  unfollow,
  getFollowStatus,
} from "../controllers/follows";
import { requireAuth } from "../services/auth";

const router = Router();

router.post("/", requireAuth, follow);
router.delete("/", requireAuth, unfollow);
router.get("/status", getFollowStatus);
router.get("/:authority/followers", listFollowers);
router.get("/:authority/following", listFollowing);

export default router;
