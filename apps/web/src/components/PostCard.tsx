"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PostActions } from "./PostActions";
import { resolveIpfsContent } from "../lib/ipfs";

type PostCardProps = {
  author: string;
  postId: number;
  contentCid: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  footer?: ReactNode;
};

export const PostCard = ({
  author,
  postId,
  contentCid,
  createdAt,
  likeCount,
  commentCount,
  footer,
}: PostCardProps) => {
  const [content, setContent] = useState<string | null>(null);
  const [contentError, setContentError] = useState(false);

  useEffect(() => {
    let active = true;
    setContent(null);
    setContentError(false);
    resolveIpfsContent(contentCid)
      .then((text) => {
        if (active) setContent(text);
      })
      .catch(() => {
        if (active) setContentError(true);
      });
    return () => {
      active = false;
    };
  }, [contentCid]);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Author</p>
          <p className="text-sm font-semibold text-zinc-900">{author}</p>
        </div>
        {createdAt ? (
          <p className="text-xs text-zinc-400">{createdAt}</p>
        ) : null}
      </div>
      <div className="mt-4 rounded-xl bg-zinc-50 p-4 text-sm text-zinc-700">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Post</p>
        {content ? (
          <p className="mt-2 text-sm text-zinc-700">{content}</p>
        ) : contentError ? (
          <p className="mt-2 text-xs text-zinc-400">Content unavailable.</p>
        ) : (
          <p className="mt-2 text-xs text-zinc-400">Loading...</p>
        )}
      </div>
      <PostActions
        author={author}
        postId={postId}
        likeCount={likeCount}
        commentCount={commentCount}
      />
      {footer ? <div className="mt-4">{footer}</div> : null}
    </article>
  );
};
