import { authFetch } from "./auth";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const gateway =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

type ResolvedPost = { content: string; imageCid?: string | null };

const contentCache = new Map<string, string>();
const postCache = new Map<string, ResolvedPost>();

const pinJsonPayload = async (
  payload: Record<string, any>,
  name?: string
) => {
  const res = await authFetch(`${apiBase}/ipfs/pin-json`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: payload, name }),
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to pin to IPFS.");
  }
  return data.data?.IpfsHash as string;
};

export const pinPostContent = async (
  content: string,
  imageCid?: string | null
) =>
  pinJsonPayload(
    { type: "post", content, imageCid: imageCid || null },
    "post"
  );

export const pinCommentContent = async (content: string) =>
  pinJsonPayload({ type: "comment", content }, "comment");

export const pinFileContent = async (file: File, name?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (name) {
    form.append("name", name);
  }

  const res = await authFetch(`${apiBase}/ipfs/pin-file`, {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to pin file.");
  }
  return data.data?.IpfsHash as string;
};

export const resolveIpfsPost = async (cid: string) => {
  if (postCache.has(cid)) {
    return postCache.get(cid) as ResolvedPost;
  }

  const res = await fetch(`${gateway}/${cid}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch IPFS content.");
  }

  const text = await res.text();
  let resolved: ResolvedPost = { content: text, imageCid: null };
  try {
    const json = JSON.parse(text);
    if (json && typeof json.content === "string") {
      resolved = {
        content: json.content,
        imageCid: json.imageCid || null,
      };
    }
  } catch {
    // keep raw text
  }

  postCache.set(cid, resolved);
  return resolved;
};

export const resolveIpfsContent = async (cid: string) => {
  if (contentCache.has(cid)) {
    return contentCache.get(cid) as string;
  }

  const resolved = await resolveIpfsPost(cid);
  contentCache.set(cid, resolved.content);
  return resolved.content;
};
