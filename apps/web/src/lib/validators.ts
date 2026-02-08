import { CONSTRAINTS } from "./constraints";

export const isValidUsername = (value: string) =>
  value.length > 0 && value.length <= CONSTRAINTS.usernameMax;

export const isValidDisplayName = (value: string) =>
  value.length > 0 && value.length <= CONSTRAINTS.displayNameMax;

export const isValidCid = (value: string) =>
  value.length > 0 && value.length <= CONSTRAINTS.cidMax;
