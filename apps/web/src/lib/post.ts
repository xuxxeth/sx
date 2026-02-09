const toBase64Url = (input: string) => {
  const encoded =
    typeof window === "undefined"
      ? Buffer.from(input, "utf8").toString("base64")
      : btoa(input);
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return typeof window === "undefined"
    ? Buffer.from(padded, "base64").toString("utf8")
    : atob(padded);
};

export const encodePostKey = (author: string, postId: number) =>
  toBase64Url(`${author}:${postId}`);

export const decodePostKey = (postKey: string) => {
  const decoded = fromBase64Url(postKey);
  const [author, postIdRaw] = decoded.split(":");
  const postId = Number(postIdRaw);
  return { author, postId };
};
