import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const apiBase =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000/api";

  const apiKey = process.env.INDEXER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "INDEXER_API_KEY not configured" },
      { status: 500 }
    );
  }

  const res = await fetch(`${apiBase}/index/replay`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body || {}),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
