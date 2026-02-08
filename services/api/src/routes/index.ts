import { Router } from "express";
import profiles from "./profiles";
import follows from "./follows";
import posts from "./posts";
import tips from "./tips";
import likes from "./likes";
import comments from "./comments";
import topics from "./topics";
import ipfs from "./ipfs";
import auth from "./auth";
import indexer from "./indexer";
import feed from "./feed";
import indexerState from "./indexer-state";
import indexerReplay from "./indexer-replay";
import health from "./health";

const router = Router();

router.use("/profiles", profiles);
router.use("/follows", follows);
router.use("/posts", posts);
router.use("/tips", tips);
router.use("/likes", likes);
router.use("/comments", comments);
router.use("/topics", topics);
router.use("/ipfs", ipfs);
router.use("/auth", auth);
router.use("/index", indexer);
router.use("/index", indexerState);
router.use("/index", indexerReplay);
router.use("/health", health);
router.use("/feed", feed);

export default router;
