import { Router } from "express";
import { createPostIndex, listPostsByAuthor } from "../controllers/posts";

const router = Router();

router.post("/", createPostIndex);
router.get("/:author", listPostsByAuthor);

export default router;
