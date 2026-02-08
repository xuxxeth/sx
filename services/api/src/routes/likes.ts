import { Router } from "express";
import {
  listLikesByPost,
  getLikeStatus,
  getLikeCount,
  createLike,
  removeLike,
} from "../controllers/likes";
import { requireAuth } from "../services/auth";

const router = Router();

router.get("/status", getLikeStatus);
router.get("/count", getLikeCount);
router.get("/:author/:postId", listLikesByPost);

router.post("/", requireAuth, createLike);
router.delete("/", requireAuth, removeLike);

export default router;
