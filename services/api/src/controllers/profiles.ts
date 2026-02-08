import { Request, Response } from "express";
import { ProfileModel } from "../store/models";
import {
  isValidCid,
  isValidDisplayName,
  isValidUsername,
  isValidAddress,
} from "../services/validators";
import { badRequest, conflict, notFound } from "../services/http";

export const createProfile = async (req: Request, res: Response) => {
  const { authority, username, displayName, bioCid, avatarCid } = req.body;

  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }
  if (!isValidUsername(username)) {
    return badRequest(res, "Invalid username.");
  }
  if (!isValidDisplayName(displayName)) {
    return badRequest(res, "Invalid display name.");
  }
  if (!isValidCid(bioCid) || !isValidCid(avatarCid)) {
    return badRequest(res, "Invalid CID.");
  }

  const existing = await ProfileModel.findOne({
    $or: [{ authority }, { username }],
  }).lean();
  if (existing) {
    return conflict(res, "Profile already exists or username taken.");
  }

  const profile = await ProfileModel.create({
    authority,
    username,
    displayName,
    bioCid,
    avatarCid,
  });

  return res.status(201).json({ ok: true, data: profile });
};

export const updateProfile = async (req: Request, res: Response) => {
  const { authority } = req.params;
  const { displayName, bioCid, avatarCid } = req.body;

  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }
  if (!isValidDisplayName(displayName)) {
    return badRequest(res, "Invalid display name.");
  }
  if (!isValidCid(bioCid) || !isValidCid(avatarCid)) {
    return badRequest(res, "Invalid CID.");
  }

  const profile = await ProfileModel.findOneAndUpdate(
    { authority },
    { displayName, bioCid, avatarCid },
    { new: true }
  ).lean();

  if (!profile) {
    return notFound(res, "Profile not found.");
  }

  return res.json({ ok: true, data: profile });
};

export const updateUsername = async (req: Request, res: Response) => {
  const { authority } = req.params;
  const { username } = req.body;

  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }
  if (!isValidUsername(username)) {
    return badRequest(res, "Invalid username.");
  }

  const conflictProfile = await ProfileModel.findOne({ username }).lean();
  if (conflictProfile && conflictProfile.authority !== authority) {
    return conflict(res, "Username already taken.");
  }

  const profile = await ProfileModel.findOneAndUpdate(
    { authority },
    { username },
    { new: true }
  ).lean();

  if (!profile) {
    return notFound(res, "Profile not found.");
  }

  return res.json({ ok: true, data: profile });
};

export const getProfileByAuthority = async (req: Request, res: Response) => {
  const { authority } = req.params;
  if (!isValidAddress(authority)) {
    return badRequest(res, "Invalid authority address.");
  }
  const profile = await ProfileModel.findOne({ authority }).lean();
  if (!profile) {
    return notFound(res, "Profile not found.");
  }
  return res.json({ ok: true, data: profile });
};

export const getProfileByUsername = async (req: Request, res: Response) => {
  const { username } = req.params;
  if (!isValidUsername(username)) {
    return badRequest(res, "Invalid username.");
  }
  const profile = await ProfileModel.findOne({ username }).lean();
  if (!profile) {
    return notFound(res, "Profile not found.");
  }
  return res.json({ ok: true, data: profile });
};
