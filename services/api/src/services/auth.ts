import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { isValidAddress } from "./validators";

const challengeStore = new Map<
  string,
  { message: string; expiresAt: number }
>();

const AUTH_TTL_MS = 5 * 60 * 1000;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }
  return secret;
};

export const createChallenge = (address: string) => {
  const nonce = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + AUTH_TTL_MS;
  const message = [
    "SX Auth",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `IssuedAt: ${new Date(now).toISOString()}`,
    `ExpiresAt: ${new Date(expiresAt).toISOString()}`,
  ].join("\n");
  challengeStore.set(address, { message, expiresAt });
  return { message, expiresAt };
};

export const verifySignature = (address: string, message: string, signature: string) => {
  const record = challengeStore.get(address);
  if (!record) return false;
  if (record.message !== message) return false;
  if (Date.now() > record.expiresAt) return false;

  try {
    const publicKey = bs58.decode(address);
    let sig: Uint8Array;
    try {
      sig = bs58.decode(signature);
    } catch {
      sig = Buffer.from(signature, "base64");
    }
    const msgBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(msgBytes, sig, publicKey);
  } catch {
    return false;
  }
};

export const issueToken = (address: string) => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "2h";
  const token = jwt.sign({ sub: address }, secret, { expiresIn });
  const decoded = jwt.decode(token) as { exp?: number } | null;
  return { token, exp: decoded?.exp || 0 };
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  const token = authHeader.slice(7);
  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret) as { sub?: string };
    if (!payload?.sub || !isValidAddress(payload.sub)) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    (req as any).auth = { address: payload.sub };
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
};

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
