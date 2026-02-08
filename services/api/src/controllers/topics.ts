import { Request, Response } from "express";
import { TopicModel, PostModel } from "../store/models";
import { badRequest, conflict } from "../services/http";
import { isValidPostId, isValidTopic, isValidAddress } from "../services/validators";
import { getPagination } from "../services/pagination";
import { ok, okPaged } from "../services/response";

export const listTopics = async (req: Request, res: Response) => {
  const { limit, offset } = getPagination(req);

  const topics = await TopicModel.aggregate([
    { $group: { _id: "$topic", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $skip: offset },
    { $limit: limit },
  ]);

  return okPaged(
    res,
    topics.map((topic) => ({ topic: topic._id, count: topic.count })),
    { limit, offset, total: topics.length }
  );
};

export const getTopicFeed = async (req: Request, res: Response) => {
  const { topic } = req.params;
  if (!topic || typeof topic !== "string") {
    return badRequest(res, "Invalid topic.");
  }

  const { limit, offset } = getPagination(req);

  const topicEntries = await TopicModel.find({ topic })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const postFilters = topicEntries.map((entry) => ({
    author: entry.author,
    postId: entry.postId,
  }));
  const posts = postFilters.length
    ? await PostModel.find({ $or: postFilters }).lean()
    : [];

  return ok(res, { posts, topic, total: topicEntries.length });
};

export const createTopic = async (req: Request, res: Response) => {
  const { topic, postId } = req.body || {};
  const author = (req as any).auth?.address as string;
  const postIdNum = Number(postId);

  if (!isValidAddress(author)) {
    return badRequest(res, "Invalid author address.");
  }
  if (!isValidTopic(topic)) {
    return badRequest(res, "Invalid topic.");
  }
  if (!isValidPostId(postIdNum)) {
    return badRequest(res, "Invalid postId.");
  }

  const postKey = `${author}:${postIdNum}`;
  try {
    const entry = await TopicModel.create({
      topic,
      author,
      postId: postIdNum,
      postKey,
    });
    return res.status(201).json({ ok: true, data: entry });
  } catch (err: any) {
    if (err?.code === 11000) {
      return conflict(res, "Topic already indexed.");
    }
    throw err;
  }
};
