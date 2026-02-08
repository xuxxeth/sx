"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { HomeNav } from "./HomeNav";
import { SearchCard } from "./SearchCard";
import { TrendsPanel } from "./TrendsPanel";
import { ConfigWarnings } from "./ConfigWarnings";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { ProfileForm } from "./ProfileForm";
import { resolveIpfsContent } from "../lib/ipfs";
import {
  buildIdenticonDataUrl,
  buildProfileCoverGradient,
} from "../lib/identicon";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";
const defaultAuthority = process.env.NEXT_PUBLIC_DEFAULT_AUTHORITY || "";

type ProfileSummary = {
  profile: {
    authority: string;
    username: string;
    displayName: string;
    bioCid: string;
    avatarCid: string;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    followers: number;
    following: number;
    posts: number;
  };
};

type PostIndex = {
  author: string;
  postId: number;
  contentCid: string;
  visibility: number;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
};

const tabs = ["Posts", "Replies", "Highlights", "Media", "Likes"];

export const ProfileShell = () => {
  const wallet = useWallet();
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [posts, setPosts] = useState<PostIndex[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [bio, setBio] = useState<string>("");

  const authority = wallet.publicKey?.toBase58() || defaultAuthority;

  const joinedLabel = useMemo(() => {
    if (!summary?.profile?.createdAt) return "Joined";
    const date = new Date(summary.profile.createdAt);
    return `Joined ${date.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
    })}`;
  }, [summary?.profile?.createdAt]);

  useEffect(() => {
    if (!authority) {
      setMessage("Connect wallet to view your profile.");
      return;
    }

    const load = async () => {
      setLoading(true);
      setMessage("");
      try {
        const [summaryRes, postsRes] = await Promise.all([
          fetch(`${apiBase}/feed/${authority}/summary`, { cache: "no-store" }),
          fetch(`${apiBase}/feed/${authority}/profile?limit=20&offset=0`, {
            cache: "no-store",
          }),
        ]);
        const summaryData = await summaryRes.json();
        const postsData = await postsRes.json();
        if (!summaryData?.ok) {
          setMessage(summaryData?.error || "Profile not found.");
          setSummary(null);
          setPosts([]);
        } else {
          setSummary(summaryData.data);
          setPosts(postsData?.data || []);
        }
      } catch (err: any) {
        setMessage(err?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authority]);

  useEffect(() => {
    if (!summary?.profile?.bioCid) {
      setBio("");
      return;
    }
    resolveIpfsContent(summary.profile.bioCid)
      .then((text) => setBio(text))
      .catch(() => setBio(""));
  }, [summary?.profile?.bioCid]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50 via-white to-zinc-100 text-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-6 pb-16 pt-8">
        <HomeNav />

        <main className="flex-1">
          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_30px_80px_-60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-3 border-b border-zinc-200 px-6 py-4">
              <button className="text-lg">←</button>
              <div>
                <p className="text-sm font-semibold">
                  {summary?.profile.displayName || "Profile"}
                </p>
                <p className="text-xs text-zinc-400">
                  {summary?.stats.posts || 0} posts
                </p>
              </div>
            </div>

            <div
              className="relative h-44"
              style={{
                background: buildProfileCoverGradient(authority),
              }}
            />

            <div className="px-6 pb-4">
              <div className="-mt-12 flex items-end justify-between">
                <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-zinc-200">
                  <img
                    src={
                      summary?.profile.avatarCid
                        ? `${
                            process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
                            "https://gateway.pinata.cloud/ipfs"
                          }/${summary.profile.avatarCid}`
                        : buildIdenticonDataUrl(authority, 96)
                    }
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowEdit((prev) => !prev)}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  Edit profile
                </button>
              </div>

              <div className="mt-3">
                <h2 className="text-lg font-semibold">
                  {summary?.profile.displayName || "Unnamed"}
                </h2>
                <p className="text-sm text-zinc-500">
                  @{summary?.profile.username || "username"}
                </p>
                {bio ? (
                  <p className="mt-2 text-sm text-zinc-700">{bio}</p>
                ) : null}
                <div className="mt-3 text-xs text-zinc-500">{joinedLabel}</div>
                <div className="mt-3 flex gap-4 text-sm text-zinc-600">
                  <span>
                    <strong className="text-zinc-900">
                      {summary?.stats.following || 0}
                    </strong>{" "}
                    Following
                  </span>
                  <span>
                    <strong className="text-zinc-900">
                      {summary?.stats.followers || 0}
                    </strong>{" "}
                    Followers
                  </span>
                </div>
              </div>
            </div>

            {showEdit ? (
              <div className="border-t border-zinc-200 px-6 py-4">
                <ProfileForm />
              </div>
            ) : null}

            <div className="border-t border-zinc-200 px-6">
              <div className="flex gap-6 text-sm font-semibold text-zinc-500">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`border-b-2 px-1 py-4 ${
                      tab === "Posts"
                        ? "border-zinc-900 text-zinc-900"
                        : "border-transparent"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4">
              <ErrorBanner message={message || null} />
              {loading ? (
                <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                  Loading profile...
                </div>
              ) : null}
              {!loading && message ? (
                <EmptyState
                  title="No profile data"
                  description="Once a profile is created on-chain and indexed, it will appear here."
                  actionLabel="Create Profile"
                  actionHref="/profile"
                  showRetry
                />
              ) : null}
              {!loading && !message && posts.length === 0 ? (
                <EmptyState
                  title="No posts yet"
                  description="Once posts are indexed, they will appear here."
                  actionLabel="Create Post"
                  actionHref="/"
                  showRetry
                />
              ) : null}
              <div className="grid gap-4">
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

        <aside className="hidden w-80 flex-col gap-6 xl:flex">
          <SearchCard />
          <TrendsPanel />
          <ConfigWarnings />
        </aside>
      </div>
    </div>
  );
};
