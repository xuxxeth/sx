import { Request } from "express";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const getPagination = (req: Request) => {
  const limitRaw = Number(req.query.limit ?? 50);
  const offsetRaw = Number(req.query.offset ?? 0);

  const limit = clamp(Number.isFinite(limitRaw) ? limitRaw : 50, 1, 200);
  const offset = clamp(Number.isFinite(offsetRaw) ? offsetRaw : 0, 0, 100000);

  return { limit, offset };
};
