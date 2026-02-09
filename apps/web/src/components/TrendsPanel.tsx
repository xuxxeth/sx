"use client";

import { useEffect, useMemo, useState } from "react";
import { resolveIpfsPost } from "../lib/ipfs";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

type Trend =
  | {
      type: "topic";
      topic: string;
      count: number;
    }
  | {
      type: "post";
      eventId?: string;
      author: string;
      postId: number;
      contentCid: string;
    };

export const TrendsPanel = () => {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [snippets, setSnippets] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/topics?mode=feed&limit=3&offset=0`, {
          cache: "no-store",
        });
        const data = await res.json();
        setTrends(data?.data || []);
      } catch (_) {
        setTrends([]);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadSnippets = async () => {
      const entries = await Promise.all(
        trends
          .filter((item): item is Extract<Trend, { type: "post" }> => item.type === "post")
          .map(async (item) => {
            try {
              const post = await resolveIpfsPost(item.contentCid);
              const text = post.content || "Untitled post";
              return [
                `${item.author}:${item.postId}`,
                text.length > 80 ? `${text.slice(0, 80)}…` : text,
              ] as const;
            } catch {
              return [
                `${item.author}:${item.postId}`,
                "Content unavailable",
              ] as const;
            }
          })
      );
      setSnippets(Object.fromEntries(entries));
    };

    if (trends.some((item) => item.type === "post")) {
      loadSnippets();
    }
  }, [trends]);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">What’s happening</h3>
        <button className="text-xs text-zinc-500">⋯</button>
      </div>
      <div className="mt-4 space-y-4">
        {trends.length === 0 ? (
          <p className="text-xs text-zinc-400">No topics yet.</p>
        ) : null}
        {trends.map((trend) => {
          if (trend.type === "post") {
            const key = `${trend.author}:${trend.postId}`;
            return (
              <a
                key={key}
                href={
                  trend.eventId
                    ? `/post/${encodeURIComponent(trend.eventId)}`
                    : undefined
                }
                className="block rounded-2xl border border-zinc-200 px-3 py-2 transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <p className="text-xs text-zinc-400">Latest post</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {snippets[key] || "Loading..."}
                </p>
              </a>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
