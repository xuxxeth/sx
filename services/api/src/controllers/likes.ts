import { Request, Response } from "express";
import { LikeModel } from "../store/models";
import { badRequest } from "../services/http";
import { isValidAddress, isValidPostId } from "../services/validators";
import { getPagination } from "../services/pagination";
import { ok, okPaged } from "../services/response";

export const listLikesByPost = async (req: Request, res: Response) => {
  const { author, postId } = req.params;
  const postIdNum = Number(postId);

  if (!isValidAddress(author) || !isValidPostId(postIdNum)) {
    return badRequest(res, "Invalid post reference.");
  }

  const { limit, offset } = getPagination(req);
  const postKey = `${author}:${postIdNum}`;

  const [likes, total] = await Promise.all([
    LikeModel.find({ postKey })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    LikeModel.countDocuments({ postKey }),
  ]);

  return okPaged(res, likes, { limit, offset, total });
};

export const getLikeStatus = async (req: Request, res: Response) => {
  const liker = String(req.query.liker || "");
  const author = String(req.query.author || "");
  const postId = Number(req.query.postId || 0);

  if (!isValidAddress(liker) || !isValidAddress(author) || !isValidPostId(postId)) {
    return badRequest(res, "Invalid like status query.");
  }

  const postKey = `${author}:${postId}`;
  const exists = await LikeModel.exists({ liker, postKey });
  return ok(res, { liked: Boolean(exists) });
};

export const getLikeCount = async (req: Request, res: Response) => {
  const author = String(req.query.author || "");
  const postId = Number(req.query.postId || 0);

  if (!isValidAddress(author) || !isValidPostId(postId)) {
    return badRequest(res, "Invalid like count query.");
  }

  const postKey = `${author}:${postId}`;
  const count = await LikeModel.countDocuments({ postKey });
  return ok(res, { count });
};
