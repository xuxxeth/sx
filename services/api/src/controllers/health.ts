import { Request, Response } from "express";
import mongoose from "mongoose";

const getMongoStatus = () => {
  const mongoState = mongoose.connection.readyState;
  const mongoStatus =
    mongoState === 1 ? "connected" : mongoState === 2 ? "connecting" : "disconnected";
  return { mongoState, mongoStatus };
};

export const healthDetails = async (_req: Request, res: Response) => {
  const { mongoState, mongoStatus } = getMongoStatus();

  res.json({
    ok: true,
    data: {
      mongoStatus,
      mongoState,
      indexerEnabled: process.env.ENABLE_INDEXER_WORKER === "true",
      rpcUrl: process.env.SOLANA_RPC_URL || "",
      programId: process.env.SOLANA_PROGRAM_ID || "",
    },
  });
};

export const readiness = async (_req: Request, res: Response) => {
  const { mongoState } = getMongoStatus();
  if (mongoState !== 1) {
    return res.status(503).json({ ok: false, error: "Mongo not ready" });
  }
  return res.json({ ok: true });
};

export const summary = async (_req: Request, res: Response) => {
  const { mongoStatus } = getMongoStatus();

  res.json({
    ok: true,
    data: {
      mongoStatus,
      indexerEnabled: process.env.ENABLE_INDEXER_WORKER === "true",
      rpcConfigured: Boolean(process.env.SOLANA_RPC_URL),
      programConfigured: Boolean(process.env.SOLANA_PROGRAM_ID),
    },
  });
};
