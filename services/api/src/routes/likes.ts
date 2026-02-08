import { Router } from "express";
import { listLikesByPost, getLikeStatus, getLikeCount } from "../controllers/likes";

const router = Router();

router.get("/status", getLikeStatus);
router.get("/count", getLikeCount);
router.get("/:author/:postId", listLikesByPost);

export default router;
