import { Request, Response } from "express";
import { badRequest } from "../services/http";
import { pinJsonToIpfs } from "../services/ipfs";

export const pinJson = async (req: Request, res: Response) => {
  const { content, type, name } = req.body || {};

  if (!content) {
    return badRequest(res, "content is required");
  }

  const payload =
    typeof content === "string"
      ? { type: type || "text", content }
      : { type: type || "json", ...content };

  const result = await pinJsonToIpfs(payload, name);
  return res.json({ ok: true, data: result });
};
