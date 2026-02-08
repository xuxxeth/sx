import { Request, Response } from "express";
import { FollowModel } from "../store/models";
import { badRequest, conflict, notFound } from "../services/http";
import { isValidAddress } from "../services/validators";
import { getPagination } from "../services/pagination";
import { ok, okPaged } from "../services/response";

export const follow = async (req: Request, res: Response) => {
  const { follower, following } = req.body;

  if (!isValidAddress(follower) || !isValidAddress(following)) {
    return badRequest(res, "Invalid follower/following address.");
  }
  if (follower === following) {
    return badRequest(res, "Cannot follow yourself.");
  }

  try {
    const edge = await FollowModel.create({ follower, following });
    return res.status(201).json({ ok: true, data: edge });
  } catch (err: any) {
    if (err?.code === 11000) {
      return conflict(res, "Already following.");
    }
    throw err;
  }
};

export const unfollow = async (req: Request, res: Response) => {
  const { follower, following } = req.body;

  if (!isValidAddress(follower) || !isValidAddress(following)) {
    return badRequest(res, "Invalid follower/following address.");
  }

  const result = await FollowModel.findOneAndDelete({ follower, following }).lean();
  if (!result) {
    return notFound(res, "Follow relationship not found.");
  }

  return ok(res, { success: true });
};

export const listFollowers = async (req: Request, res: Response) => {
  const { authority } = req.params;

  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }

  const { limit, offset } = getPagination(req);

  const [followers, total] = await Promise.all([
    FollowModel.find({ following: authority })
      .lean()
      .select("follower -_id")
      .skip(offset)
      .limit(limit),
    FollowModel.countDocuments({ following: authority }),
  ]);

  return okPaged(
    res,
    followers.map((f) => f.follower),
    { limit, offset, total }
  );
};

export const listFollowing = async (req: Request, res: Response) => {
  const { authority } = req.params;

  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }

  const { limit, offset } = getPagination(req);

  const [following, total] = await Promise.all([
    FollowModel.find({ follower: authority })
      .lean()
      .select("following -_id")
      .skip(offset)
      .limit(limit),
    FollowModel.countDocuments({ follower: authority }),
  ]);

  return okPaged(
    res,
    following.map((f) => f.following),
    { limit, offset, total }
  );
};

export const getFollowStatus = async (req: Request, res: Response) => {
  const follower = String(req.query.follower || "");
  const following = String(req.query.following || "");

  if (!isValidAddress(follower) || !isValidAddress(following)) {
    return badRequest(res, "Invalid follower/following address.");
  }

  const exists = await FollowModel.exists({ follower, following });
  return ok(res, { following: Boolean(exists) });
};
