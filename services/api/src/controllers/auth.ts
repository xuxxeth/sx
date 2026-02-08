import { Request, Response } from "express";
import { badRequest } from "../services/http";
import {
  createChallenge,
  verifySignature,
  issueToken,
} from "../services/auth";
import { isValidAddress } from "../services/validators";

export const requestChallenge = (req: Request, res: Response) => {
  const { address } = req.body || {};
  if (!isValidAddress(address)) {
    return badRequest(res, "Invalid address.");
  }

  const { message, expiresAt } = createChallenge(address);
  return res.json({ ok: true, data: { message, expiresAt } });
};

export const verifyChallenge = (req: Request, res: Response) => {
  const { address, message, signature } = req.body || {};
  if (!isValidAddress(address)) {
    return badRequest(res, "Invalid address.");
  }
  if (!message || !signature) {
    return badRequest(res, "Missing message or signature.");
  }

  const valid = verifySignature(address, message, signature);
  if (!valid) {
    return res.status(401).json({ ok: false, error: "Invalid signature." });
  }

  const { token, exp } = issueToken(address);
  return res.json({ ok: true, data: { token, exp } });
};
