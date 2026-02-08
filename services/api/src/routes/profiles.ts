import { Router } from "express";
import {
  createProfile,
  getProfileByAuthority,
  getProfileByUsername,
  updateProfile,
  updateUsername,
} from "../controllers/profiles";

const router = Router();

router.post("/", createProfile);
router.get("/username/:username", getProfileByUsername);
router.get("/:authority", getProfileByAuthority);
router.patch("/:authority", updateProfile);
router.patch("/:authority/username", updateUsername);

export default router;
