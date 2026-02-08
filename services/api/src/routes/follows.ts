import { Router } from "express";
import {
  follow,
  listFollowers,
  listFollowing,
  unfollow,
  getFollowStatus,
} from "../controllers/follows";

const router = Router();

router.post("/", follow);
router.delete("/", unfollow);
router.get("/status", getFollowStatus);
router.get("/:authority/followers", listFollowers);
router.get("/:authority/following", listFollowing);

export default router;
