import { Request, Response } from "express";
import { getIndexerState } from "../services/indexer-state";

export const getState = async (_req: Request, res: Response) => {
  const state = await getIndexerState("default");
  return res.json({ ok: true, data: state || { lastSlot: 0 } });
};
