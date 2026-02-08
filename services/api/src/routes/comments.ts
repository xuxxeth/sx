import { Router } from "express";
import { listCommentsByPost, createComment } from "../controllers/comments";
import { requireAuth } from "../services/auth";

const router = Router();

router.get("/:author/:postId", listCommentsByPost);

router.post("/", requireAuth, createComment);

export default router;
