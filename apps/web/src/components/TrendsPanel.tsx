"use client";

import { useEffect, useState } from "react";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

type Trend = { topic: string; count: number };

export const TrendsPanel = () => {
  const [trends, setTrends] = useState<Trend[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/topics?limit=5&offset=0`, {
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
        {trends.map((trend) => (
          <div key={trend.topic}>
            <p className="text-xs text-zinc-400">Trending</p>
            <p className="text-sm font-semibold text-zinc-900">
              #{trend.topic}
            </p>
            <p className="text-xs text-zinc-400">{trend.count} posts</p>
          </div>
        ))}
      </div>
    </div>
  );
};
