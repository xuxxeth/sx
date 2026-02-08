import { Router } from "express";
import { createPostIndex, listPostsByAuthor } from "../controllers/posts";
import { requireAuth } from "../services/auth";

const router = Router();

router.post("/", requireAuth, createPostIndex);
router.get("/:author", listPostsByAuthor);

export default router;
