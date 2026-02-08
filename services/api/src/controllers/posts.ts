import { Request, Response } from "express";
import { PostModel } from "../store/models";
import { badRequest, conflict } from "../services/http";
import {
  isValidAddress,
  isValidCid,
  isValidPostId,
  isValidVisibility,
} from "../services/validators";
import { getPagination } from "../services/pagination";
import { okPaged } from "../services/response";

export const createPostIndex = async (req: Request, res: Response) => {
  const { author, postId, contentCid, visibility } = req.body;

  if (!isValidAddress(author)) {
    return badRequest(res, "Invalid author address.");
  }
  if (!isValidPostId(postId)) {
    return badRequest(res, "Invalid postId.");
  }
  if (!isValidCid(contentCid)) {
    return badRequest(res, "Invalid content CID.");
  }
  if (!isValidVisibility(visibility)) {
    return badRequest(res, "Invalid visibility.");
  }

  try {
    const post = await PostModel.create({
      author,
      postId,
      contentCid,
      visibility,
    });
    return res.status(201).json({ ok: true, data: post });
  } catch (err: any) {
    if (err?.code === 11000) {
      return conflict(res, "Post already exists.");
    }
    throw err;
  }
};

export const listPostsByAuthor = async (req: Request, res: Response) => {
  const { author } = req.params;

  if (!isValidAddress(author)) {
    return badRequest(res, "Invalid author address.");
  }

  const { limit, offset } = getPagination(req);

  const [posts, total] = await Promise.all([
    PostModel.find({ author })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    PostModel.countDocuments({ author }),
  ]);
  return okPaged(res, posts, { limit, offset, total });
};
