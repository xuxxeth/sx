import { Request, Response } from "express";
import { ProfileModel, TopicModel } from "../store/models";
import { badRequest } from "../services/http";
import { getPagination } from "../services/pagination";
import { ok } from "../services/response";

export const searchAll = async (req: Request, res: Response) => {
  const query = String(req.query.q || "").trim();
  if (!query) {
    return badRequest(res, "Missing query.");
  }

  const { limit } = getPagination(req);
  const regex = new RegExp(query, "i");

  const [profiles, topics] = await Promise.all([
    ProfileModel.find({
      $or: [{ username: regex }, { displayName: regex }],
    })
      .limit(Math.min(limit, 5))
      .lean(),
    TopicModel.aggregate([
      { $match: { topic: regex } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.min(limit, 5) },
    ]),
  ]);

  return ok(res, {
    profiles,
    topics: topics.map((entry) => ({ topic: entry._id, count: entry.count })),
  });
};
