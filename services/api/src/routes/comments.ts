import { Router } from "express";
import { listCommentsByPost } from "../controllers/comments";

const router = Router();

router.get("/:author/:postId", listCommentsByPost);

export default router;
