import { Request, Response } from "express";
import { badRequest } from "../services/http";
import { pinJsonToIpfs, pinFileToIpfs } from "../services/ipfs";

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

export const pinFile = async (req: Request, res: Response) => {
  const file = (req as any).file as
    | { buffer: Buffer; originalname: string; mimetype: string }
    | undefined;

  if (!file) {
    return badRequest(res, "file is required");
  }

  const name = req.body?.name as string | undefined;
  const result = await pinFileToIpfs(
    file.buffer,
    file.originalname,
    file.mimetype,
    name
  );
  return res.json({ ok: true, data: result });
};
