import { Request, Response } from "express";
import { TipModel } from "../store/models";
import { badRequest, conflict } from "../services/http";
import { isValidAddress, isValidLamports, isValidPostId } from "../services/validators";
import { getPagination } from "../services/pagination";
import { okPaged } from "../services/response";

export const createTip = async (req: Request, res: Response) => {
  const { from, to, tipId, amountLamports } = req.body;

  if (!isValidAddress(from) || !isValidAddress(to)) {
    return badRequest(res, "Invalid from/to address.");
  }
  if (!isValidPostId(tipId)) {
    return badRequest(res, "Invalid tipId.");
  }
  if (!isValidLamports(amountLamports)) {
    return badRequest(res, "Invalid amountLamports.");
  }

  try {
    const tip = await TipModel.create({
      from,
      to,
      tipId,
      amountLamports,
    });
    return res.status(201).json({ ok: true, data: tip });
  } catch (err: any) {
    if (err?.code === 11000) {
      return conflict(res, "Tip already exists.");
    }
    throw err;
  }
};

export const listTipsByRecipient = async (req: Request, res: Response) => {
  const { to } = req.params;

  if (!isValidAddress(to)) {
    return badRequest(res, "Invalid recipient address.");
  }

  const { limit, offset } = getPagination(req);

  const [tips, total] = await Promise.all([
    TipModel.find({ to })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    TipModel.countDocuments({ to }),
  ]);
  return okPaged(res, tips, { limit, offset, total });
};
