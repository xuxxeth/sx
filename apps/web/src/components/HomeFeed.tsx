"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const tabs = [
  { key: "public", label: "For you" },
  { key: "following", label: "Following" },
] as const;

type PostIndex = {
  author: string;
  postId: number;
  contentCid: string;
  visibility: number;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
};

export const HomeFeed = () => {
  const wallet = useWallet();
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("public");
  const [posts, setPosts] = useState<PostIndex[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endpoint = useMemo(() => {
    if (tab === "public") {
      return `${apiBase}/feed/public?limit=20&offset=0`;
    }
    if (!wallet.publicKey) {
      return null;
    }
    return `${apiBase}/feed/following?authority=${wallet.publicKey.toBase58()}&limit=20&offset=0`;
  }, [tab, wallet.publicKey]);

  const load = useCallback(async () => {
    if (!endpoint) {
      setPosts([]);
      setError("Connect wallet to view following feed.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json();
      if (!data?.ok) {
        setError(data?.error || "Failed to load feed.");
        setPosts([]);
      } else {
        setPosts(data.data || []);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load feed.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handler = () => {
      load();
    };
    window.addEventListener("sx:feed-refresh", handler);
    return () => window.removeEventListener("sx:feed-refresh", handler);
  }, [load]);

  return (
    <div>
      <div className="flex gap-4 border-b border-zinc-200 pb-4 text-sm font-semibold">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-full px-4 py-2 ${
              tab === item.key
                ? "bg-zinc-900 text-white"
                : "text-zinc-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
            Loading feed...
          </div>
        ) : null}
        {error ? (
          <EmptyState title="Feed unavailable" description={error} showRetry />
        ) : null}
        {!loading && !error && posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Once users publish, their posts will appear here."
          />
        ) : null}
        {posts.map((post) => (
          <PostCard
            key={`${post.author}-${post.postId}`}
            author={post.author}
            postId={post.postId}
            contentCid={post.contentCid}
            createdAt={new Date(post.createdAt).toLocaleString()}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
          />
        ))}
      </div>
    </div>
  );
};
