import Link from "next/link";
import { fetchJson } from "../../lib/api";
import { Shell } from "../../components/Shell";
import { SectionCard } from "../../components/SectionCard";
import { PostCard } from "../../components/PostCard";
import { Stat } from "../../components/Stat";
import { ProfileForm } from "../../components/ProfileForm";
import { EmptyState } from "../../components/EmptyState";
import { ErrorBanner } from "../../components/ErrorBanner";

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
};

export default async function ProfilePage() {
  let summary: ProfileSummary | null = null;
  let posts: PostIndex[] = [];
  let message = "";

  if (defaultAuthority) {
    const [summaryRes, postsRes] = await Promise.all([
      fetchJson<ProfileSummary>(`/feed/${defaultAuthority}/summary`),
      fetchJson<PostIndex[]>(`/feed/${defaultAuthority}/profile?limit=10&offset=0`),
    ]);

    if (summaryRes.ok && summaryRes.data) {
      summary = summaryRes.data;
    }

    if (postsRes.ok && postsRes.data) {
      posts = postsRes.data;
    }

    if (!summary) {
      message = summaryRes.error || "Profile not found.";
    }
  } else {
    message = "Set NEXT_PUBLIC_DEFAULT_AUTHORITY to preview a profile.";
  }

  return (
    <Shell
      title="Profile Intelligence"
      subtitle="A consolidated view of identity, on-chain stats, and indexed posts."
      actions={
        <Link
          href="/compose"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white"
        >
          New Post
        </Link>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard title="Profile Snapshot">
          <ErrorBanner message={message || null} />
          {message ? (
            <EmptyState
              title="No profile data"
              description="Once a profile is created on-chain and indexed, it will appear here."
              actionLabel="Create Profile"
              actionHref="/profile"
              showRetry
            />
          ) : null}
          {summary ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Username
                </p>
                <p className="text-lg font-semibold">@{summary.profile.username}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Display Name
                </p>
                <p className="text-sm text-zinc-600">
                  {summary.profile.displayName}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
                  Authority
                </p>
                <p className="break-all font-mono text-xs text-zinc-500">
                  {summary.profile.authority}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Followers" value={summary.stats.followers} />
                <Stat label="Following" value={summary.stats.following} />
                <Stat label="Posts" value={summary.stats.posts} />
              </div>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="On-chain Profile"
          description="Create or update profile data directly on Solana."
        >
          <ProfileForm />
        </SectionCard>

        <SectionCard
          title="Recent Posts"
          description="Most recent on-chain indexed posts from this profile."
        >
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <EmptyState
                title="No posts indexed"
                description="Once posts are indexed, they will appear here."
                actionLabel="Create Post"
                actionHref="/compose"
                showRetry
              />
            ) : null}
            {posts.map((post) => (
              <PostCard
                key={`${post.author}-${post.postId}`}
                author={post.author}
                contentCid={post.contentCid}
                createdAt={new Date(post.createdAt).toLocaleString()}
              />
            ))}
          </div>
        </SectionCard>
      </div>
    </Shell>
  );
}
