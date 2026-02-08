import { Request, Response } from "express";
import {
  FollowModel,
  PostModel,
  ProfileModel,
  LikeModel,
  CommentModel,
} from "../store/models";
import { badRequest } from "../services/http";
import { isValidAddress } from "../services/validators";
import { getPagination } from "../services/pagination";
import { ok, okPaged } from "../services/response";

export const getFollowingFeed = async (req: Request, res: Response) => {
  const { authority } = req.params;
  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }

  const { limit, offset } = getPagination(req);

  const following = await FollowModel.find({ follower: authority })
    .lean()
    .select("following -_id");
  const followingList = following.map((f) => f.following);

  const [posts, total] = await Promise.all([
    PostModel.find({ author: { $in: followingList } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    PostModel.countDocuments({ author: { $in: followingList } }),
  ]);

  const withCounts = await attachCounts(posts);
  return okPaged(res, withCounts, { limit, offset, total });
};

export const getFollowingFeedByQuery = async (req: Request, res: Response) => {
  const authority = String(req.query.authority || "");
  if (!authority || !isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }

  const { limit, offset } = getPagination(req);

  const following = await FollowModel.find({ follower: authority })
    .lean()
    .select("following -_id");
  const followingList = following.map((f) => f.following);

  const [posts, total] = await Promise.all([
    PostModel.find({ author: { $in: followingList } })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    PostModel.countDocuments({ author: { $in: followingList } }),
  ]);

  const withCounts = await attachCounts(posts);
  return okPaged(res, withCounts, { limit, offset, total });
};

export const getPublicFeed = async (req: Request, res: Response) => {
  const { limit, offset } = getPagination(req);

  const [posts, total] = await Promise.all([
    PostModel.find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    PostModel.countDocuments({}),
  ]);

  const withCounts = await attachCounts(posts);
  return okPaged(res, withCounts, { limit, offset, total });
};

export const getProfileFeed = async (req: Request, res: Response) => {
  const { authority } = req.params;
  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }

  const { limit, offset } = getPagination(req);

  const [posts, total] = await Promise.all([
    PostModel.find({ author: authority })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    PostModel.countDocuments({ author: authority }),
  ]);

  const withCounts = await attachCounts(posts);
  return okPaged(res, withCounts, { limit, offset, total });
};

export const getProfileSummary = async (req: Request, res: Response) => {
  const { authority } = req.params;
  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }

  const profile = await ProfileModel.findOne({ authority }).lean();
  if (!profile) {
    return res.status(404).json({ ok: false, error: "Profile not found." });
  }

  const [followers, following, posts] = await Promise.all([
    FollowModel.countDocuments({ following: authority }),
    FollowModel.countDocuments({ follower: authority }),
    PostModel.countDocuments({ author: authority }),
  ]);

  return ok(res, {
    profile,
    stats: {
      followers,
      following,
      posts,
    },
  });
};

const attachCounts = async (posts: any[]) => {
  if (!posts.length) return posts;
  const keys = posts.map((post) => `${post.author}:${post.postId}`);

  const [likes, comments] = await Promise.all([
    LikeModel.aggregate([
      { $match: { postKey: { $in: keys } } },
      { $group: { _id: "$postKey", count: { $sum: 1 } } },
    ]),
    CommentModel.aggregate([
      { $match: { postKey: { $in: keys } } },
      { $group: { _id: "$postKey", count: { $sum: 1 } } },
    ]),
  ]);

  const likeMap = new Map(likes.map((entry) => [entry._id, entry.count]));
  const commentMap = new Map(comments.map((entry) => [entry._id, entry.count]));

  return posts.map((post) => {
    const key = `${post.author}:${post.postId}`;
    return {
      ...post,
      likeCount: likeMap.get(key) || 0,
      commentCount: commentMap.get(key) || 0,
    };
  });
};
