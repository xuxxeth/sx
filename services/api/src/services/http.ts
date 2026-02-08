import { Response } from "express";

export const badRequest = (res: Response, message: string) =>
  res.status(400).json({ ok: false, error: message });

export const notFound = (res: Response, message: string) =>
  res.status(404).json({ ok: false, error: message });

export const conflict = (res: Response, message: string) =>
  res.status(409).json({ ok: false, error: message });
