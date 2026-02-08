import { Request, Response } from "express";
import { CommentModel } from "../store/models";
import { badRequest } from "../services/http";
import { isValidAddress, isValidPostId } from "../services/validators";
import { getPagination } from "../services/pagination";
import { okPaged } from "../services/response";

export const listCommentsByPost = async (req: Request, res: Response) => {
  const { author, postId } = req.params;
  const postIdNum = Number(postId);

  if (!isValidAddress(author) || !isValidPostId(postIdNum)) {
    return badRequest(res, "Invalid post reference.");
  }

  const { limit, offset } = getPagination(req);
  const postKey = `${author}:${postIdNum}`;

  const [comments, total] = await Promise.all([
    CommentModel.find({ postKey })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    CommentModel.countDocuments({ postKey }),
  ]);

  return okPaged(res, comments, { limit, offset, total });
};
