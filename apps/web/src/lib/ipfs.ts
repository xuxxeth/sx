const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const gateway =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://gateway.pinata.cloud/ipfs";

const contentCache = new Map<string, string>();

export const pinJsonContent = async (
  content: string,
  type: string,
  name?: string
) => {
  const res = await fetch(`${apiBase}/ipfs/pin-json`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content, type, name }),
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Failed to pin to IPFS.");
  }
  return data.data?.IpfsHash as string;
};

export const resolveIpfsContent = async (cid: string) => {
  if (contentCache.has(cid)) {
    return contentCache.get(cid) as string;
  }

  const res = await fetch(`${gateway}/${cid}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch IPFS content.");
  }

  const text = await res.text();
  let content = text;
  try {
    const json = JSON.parse(text);
    if (json && typeof json.content === "string") {
      content = json.content;
    } else {
      content = text;
    }
  } catch {
    // keep as text
  }

  contentCache.set(cid, content);
  return content;
};
