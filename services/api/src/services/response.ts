import { Response } from "express";

export const ok = <T>(res: Response, data: T) => res.json({ ok: true, data });

export const okPaged = <T>(
  res: Response,
  data: T,
  meta: { limit: number; offset: number; total?: number }
) => res.json({ ok: true, data, meta });
