import { Request, Response, NextFunction } from "express";

export const requireIndexerKey = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const expected = process.env.INDEXER_API_KEY;
  if (!expected) {
    return res.status(500).json({ ok: false, error: "Indexer key not configured" });
  }

  const provided = req.header("x-api-key");
  if (!provided || provided !== expected) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  return next();
};
