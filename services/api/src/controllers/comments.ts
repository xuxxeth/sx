import { Request, Response } from "express";
import { CommentModel } from "../store/models";
import { badRequest, conflict } from "../services/http";
import { isValidAddress, isValidPostId, isValidCid } from "../services/validators";
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

export const createComment = async (req: Request, res: Response) => {
  const { postAuthor, postId, commentId, contentCid } = req.body || {};
  const author = (req as any).auth?.address as string;
  const postIdNum = Number(postId);
  const commentIdNum = Number(commentId);

  if (!isValidAddress(author) || !isValidAddress(postAuthor)) {
    return badRequest(res, "Invalid address.");
  }
  if (!isValidPostId(postIdNum) || !isValidPostId(commentIdNum)) {
    return badRequest(res, "Invalid postId/commentId.");
  }
  if (!isValidCid(contentCid)) {
    return badRequest(res, "Invalid content CID.");
  }

  const postKey = `${postAuthor}:${postIdNum}`;
  try {
    const comment = await CommentModel.create({
      author,
      postAuthor,
      postId: postIdNum,
      commentId: commentIdNum,
      contentCid,
      postKey,
    });
    return res.status(201).json({ ok: true, data: comment });
  } catch (err: any) {
    if (err?.code === 11000) {
      return conflict(res, "Comment already exists.");
    }
    throw err;
  }
};
