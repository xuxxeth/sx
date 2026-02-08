import Link from "next/link";
import { fetchJson } from "../lib/api";
import { PostCard } from "./PostCard";
import { EmptyState } from "./EmptyState";

export type PostIndex = {
  author: string;
  postId: number;
  contentCid: string;
  visibility: number;
  createdAt: string;
};

type AuthorityFeedProps = {
  authority: string;
  offset?: number;
  limit?: number;
};

export const AuthorityFeed = async ({
  authority,
  offset = 0,
  limit = 20,
}: AuthorityFeedProps) => {
  const res = await fetchJson<PostIndex[]>(
    `/feed/${authority}/following?limit=${limit}&offset=${offset}`
  );

  if (!res.ok || !res.data) {
    return (
      <EmptyState
        title="Feed unavailable"
        description={res.error || "No feed data available."}
        showRetry
      />
    );
  }

  if (res.data.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Indexer will populate this once on-chain events arrive."
      />
    );
  }

  const nextOffset = offset + limit;
  const showLoadMore = res.data.length === limit;

  return (
    <div className="grid gap-4">
      {res.data.map((post) => (
        <PostCard
          key={`${post.author}-${post.postId}`}
          author={post.author}
          contentCid={post.contentCid}
          createdAt={new Date(post.createdAt).toLocaleString()}
        />
      ))}
      {showLoadMore ? (
        <Link
          href={`/?authority=${authority}&offset=${nextOffset}`}
          className="rounded-full border border-zinc-300 px-4 py-2 text-center text-xs font-semibold text-zinc-700"
        >
          Load more
        </Link>
      ) : null}
    </div>
  );
};
