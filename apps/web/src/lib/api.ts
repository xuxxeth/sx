export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  error?: string;
  meta?: { limit: number; offset: number; total?: number };
};

const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export const fetchJson = async <T>(path: string): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
  return res.json();
};

export const postJson = async <T>(
  path: string,
  body: unknown
): Promise<ApiResponse<T>> => {
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};
