"use client";

import { useEffect, useState } from "react";
import { HomeNav } from "./HomeNav";
import { SearchCard } from "./SearchCard";
import { TrendsPanel } from "./TrendsPanel";
import { ConfigWarnings } from "./ConfigWarnings";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

type PostIndex = {
  author: string;
  postId: number;
  contentCid: string;
  visibility: number;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
};

export const TopicShell = ({ topic }: { topic: string }) => {
  const [posts, setPosts] = useState<PostIndex[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!topic) {
      setMessage("Missing topic.");
      return;
    }
    const load = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(`${apiBase}/topics/${topic}?limit=20&offset=0`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!data?.ok) {
          setMessage(data?.error || "Failed to load topic.");
          setPosts([]);
        } else {
          setPosts(data.data?.posts || []);
        }
      } catch (err: any) {
        setMessage(err?.message || "Failed to load topic.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topic]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-zinc-100 text-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 pb-16 pt-8">
        <HomeNav />

        <main className="flex-1">
          <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Topic
                </p>
                <h1 className="text-2xl font-semibold">#{topic}</h1>
              </div>
            </div>

            <div className="mt-6">
              <ErrorBanner message={message || null} />
              {loading ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                  Loading topic feed...
                </div>
              ) : null}
              {!loading && message ? (
                <EmptyState
                  title="Topic unavailable"
                  description="No matching topic found yet."
                  showRetry
                />
              ) : null}
              {!loading && !message && posts.length === 0 ? (
                <EmptyState
                  title="No posts yet"
                  description="Once posts are indexed, they will appear here."
                  showRetry
                />
              ) : null}
              <div className="mt-4 grid gap-4">
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
          </section>
        </main>

        <aside className="hidden w-80 flex-col gap-6 lg:flex">
          <SearchCard />
          <TrendsPanel />
          <ConfigWarnings />
        </aside>
      </div>
    </div>
  );
};
