"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

type SearchResult = {
  profiles: {
    authority: string;
    username: string;
    displayName: string;
    avatarCid: string;
  }[];
  topics: { topic: string; count: number }[];
};

export const SearchCard = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmed = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!trimmed) {
      setResults(null);
      return;
    }

    const handle = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${apiBase}/search?q=${encodeURIComponent(trimmed)}&limit=5`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (data?.ok) {
          setResults(data.data || null);
        } else {
          setResults(null);
        }
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handle);
  }, [trimmed]);

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm">
      <input
        placeholder="Search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm"
      />
      {loading ? (
        <p className="mt-3 text-xs text-zinc-400">Searching...</p>
      ) : null}
      {results ? (
        <div className="mt-3 space-y-4">
          {results.profiles?.length ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Profiles
              </p>
              <div className="mt-2 space-y-2">
                {results.profiles.map((profile) => (
                  <Link
                    key={profile.authority}
                    href={`/profile?authority=${profile.authority}`}
                    className="rounded-2xl border border-zinc-100 px-3 py-2"
                  >
                    <p className="text-sm font-semibold">
                      {profile.displayName}
                    </p>
                    <p className="text-xs text-zinc-500">@{profile.username}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {results.topics?.length ? (
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                Topics
              </p>
              <div className="mt-2 space-y-2">
                {results.topics.map((topic) => (
                  <Link
                    key={topic.topic}
                    href={`/topic/${encodeURIComponent(topic.topic)}`}
                    className="rounded-2xl border border-zinc-100 px-3 py-2"
                  >
                    <p className="text-sm font-semibold">#{topic.topic}</p>
                    <p className="text-xs text-zinc-500">
                      {topic.count} posts
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {!results.profiles?.length && !results.topics?.length ? (
            <p className="text-xs text-zinc-400">No results.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
