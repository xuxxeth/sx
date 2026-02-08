const MAX_USERNAME_LEN = 32;
const MAX_DISPLAY_NAME_LEN = 48;
const MAX_CID_LEN = 128;
const MAX_EVENT_ID_LEN = 128;
const MAX_TOPIC_LEN = 32;

export const isNonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isValidUsername = (username: unknown) =>
  isNonEmpty(username) && username.length <= MAX_USERNAME_LEN;

export const isValidDisplayName = (name: unknown) =>
  isNonEmpty(name) && name.length <= MAX_DISPLAY_NAME_LEN;

export const isValidCid = (cid: unknown) =>
  isNonEmpty(cid) && cid.length <= MAX_CID_LEN;

export const isValidEventId = (eventId: unknown) =>
  isNonEmpty(eventId) && eventId.length <= MAX_EVENT_ID_LEN;

export const isValidVisibility = (visibility: unknown) =>
  typeof visibility === "number" && Number.isInteger(visibility) && visibility >= 0;

export const isValidPostId = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

export const isValidLamports = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

export const isValidAddress = (value: unknown) =>
  isNonEmpty(value) && value.length >= 32 && value.length <= 64;

export const isValidTopic = (value: unknown) =>
  isNonEmpty(value) && value.length <= MAX_TOPIC_LEN;
