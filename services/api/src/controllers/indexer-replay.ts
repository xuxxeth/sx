import { Request, Response } from "express";
import { badRequest } from "../services/http";
import { runIndexerForSignature, runIndexerOnce } from "../services/indexer-runner";

export const replayFromSignature = async (req: Request, res: Response) => {
  const { fromSignature, limit, commitment, signature } = req.body || {};

  try {
    const result = signature
      ? await runIndexerForSignature(signature, commitment)
      : await runIndexerOnce({
          beforeSignature: fromSignature,
          limit,
          commitment,
        });

    return res.json({ ok: true, data: result });
  } catch (err: any) {
    if (err?.message?.includes("SOLANA_PROGRAM_ID")) {
      return badRequest(res, err.message);
    }
    throw err;
  }
};
