import { fetchJson } from "../../../lib/api";
import { Shell } from "../../../components/Shell";
import { SectionCard } from "../../../components/SectionCard";
import { PostCard } from "../../../components/PostCard";
import { Stat } from "../../../components/Stat";

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

export default async function ProfileByAuthorityPage({
  params,
}: {
  params: { authority: string };
}) {
  const { authority } = params;

  const [summaryRes, postsRes] = await Promise.all([
    fetchJson<ProfileSummary>(`/feed/${authority}/summary`),
    fetchJson<PostIndex[]>(`/feed/${authority}/profile?limit=10&offset=0`),
  ]);

  const summary = summaryRes.ok ? summaryRes.data : null;
  const posts = postsRes.ok && postsRes.data ? postsRes.data : [];

  return (
    <Shell
      title={summary ? `@${summary.profile.username}` : "Profile"}
      subtitle="Public on-chain identity, indexed and ready to query."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard title="Profile Snapshot">
          {summary ? (
            <div className="space-y-4">
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
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
              {summaryRes.error || "Profile not found."}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Posts">
          <div className="grid gap-4">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                No indexed posts yet.
              </div>
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
