import { Request, Response } from "express";
import { FollowModel, PostModel, ProfileModel, TipModel } from "../store/models";
import { badRequest } from "../services/http";
import {
  isValidAddress,
  isValidCid,
  isValidDisplayName,
  isValidPostId,
  isValidUsername,
  isValidVisibility,
  isValidLamports,
  isValidEventId,
} from "../services/validators";

const isArray = (value: unknown): value is unknown[] => Array.isArray(value);

export const indexProfiles = async (req: Request, res: Response) => {
  if (!isArray(req.body)) {
    return badRequest(res, "Body must be an array.");
  }

  const ops = [] as any[];
  for (const item of req.body) {
    const { authority, username, displayName, bioCid, avatarCid, eventId } =
      item || {};
    if (
      !isValidAddress(authority) ||
      !isValidUsername(username) ||
      !isValidDisplayName(displayName) ||
      !isValidCid(bioCid) ||
      !isValidCid(avatarCid) ||
      (eventId !== undefined && !isValidEventId(eventId))
    ) {
      return badRequest(res, "Invalid profile payload.");
    }

    const data = { authority, username, displayName, bioCid, avatarCid, eventId };
    ops.push({
      updateOne: {
        filter: eventId ? { eventId } : { authority },
        update: eventId ? { $setOnInsert: data } : data,
        upsert: true,
      },
    });
  }

  if (ops.length === 0) {
    return res.json({ ok: true, data: { inserted: 0, updated: 0 } });
  }

  const result = await ProfileModel.bulkWrite(ops, { ordered: false });
  return res.json({
    ok: true,
    data: {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    },
  });
};

export const indexFollows = async (req: Request, res: Response) => {
  if (!isArray(req.body)) {
    return badRequest(res, "Body must be an array.");
  }

  const ops = [] as any[];
  for (const item of req.body) {
    const { follower, following, eventId } = item || {};
    if (
      !isValidAddress(follower) ||
      !isValidAddress(following) ||
      (eventId !== undefined && !isValidEventId(eventId))
    ) {
      return badRequest(res, "Invalid follow payload.");
    }
    const data = { follower, following, eventId };
    ops.push({
      updateOne: {
        filter: eventId ? { eventId } : { follower, following },
        update: eventId ? { $setOnInsert: data } : data,
        upsert: true,
      },
    });
  }

  if (ops.length === 0) {
    return res.json({ ok: true, data: { inserted: 0, updated: 0 } });
  }

  const result = await FollowModel.bulkWrite(ops, { ordered: false });
  return res.json({
    ok: true,
    data: {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    },
  });
};

export const indexPosts = async (req: Request, res: Response) => {
  if (!isArray(req.body)) {
    return badRequest(res, "Body must be an array.");
  }

  const ops = [] as any[];
  for (const item of req.body) {
    const { author, postId, contentCid, visibility, eventId } = item || {};
    if (
      !isValidAddress(author) ||
      !isValidPostId(postId) ||
      !isValidCid(contentCid) ||
      !isValidVisibility(visibility) ||
      (eventId !== undefined && !isValidEventId(eventId))
    ) {
      return badRequest(res, "Invalid post payload.");
    }
    const data = { author, postId, contentCid, visibility, eventId };
    ops.push({
      updateOne: {
        filter: eventId ? { eventId } : { author, postId },
        update: eventId ? { $setOnInsert: data } : data,
        upsert: true,
      },
    });
  }

  if (ops.length === 0) {
    return res.json({ ok: true, data: { inserted: 0, updated: 0 } });
  }

  const result = await PostModel.bulkWrite(ops, { ordered: false });
  return res.json({
    ok: true,
    data: {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    },
  });
};

export const indexTips = async (req: Request, res: Response) => {
  if (!isArray(req.body)) {
    return badRequest(res, "Body must be an array.");
  }

  const ops = [] as any[];
  for (const item of req.body) {
    const { from, to, tipId, amountLamports, eventId } = item || {};
    if (
      !isValidAddress(from) ||
      !isValidAddress(to) ||
      !isValidPostId(tipId) ||
      !isValidLamports(amountLamports) ||
      (eventId !== undefined && !isValidEventId(eventId))
    ) {
      return badRequest(res, "Invalid tip payload.");
    }
    const data = { from, to, tipId, amountLamports, eventId };
    ops.push({
      updateOne: {
        filter: eventId ? { eventId } : { from, tipId },
        update: eventId ? { $setOnInsert: data } : data,
        upsert: true,
      },
    });
  }

  if (ops.length === 0) {
    return res.json({ ok: true, data: { inserted: 0, updated: 0 } });
  }

  const result = await TipModel.bulkWrite(ops, { ordered: false });
  return res.json({
    ok: true,
    data: {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
    },
  });
};
