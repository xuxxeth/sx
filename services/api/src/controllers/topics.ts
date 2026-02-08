import { Request, Response } from "express";
import { TopicModel, PostModel } from "../store/models";
import { badRequest } from "../services/http";
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
