import { Router } from "express";
import {
  createProfile,
  getProfileByAuthority,
  getProfileByUsername,
  updateProfile,
  updateUsername,
} from "../controllers/profiles";
import { requireAuth } from "../services/auth";

const router = Router();

router.post("/", requireAuth, createProfile);
router.get("/username/:username", getProfileByUsername);
router.get("/:authority", getProfileByAuthority);
router.patch("/:authority", requireAuth, updateProfile);
router.patch("/:authority/username", requireAuth, updateUsername);

export default router;
