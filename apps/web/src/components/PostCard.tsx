"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostActions } from "./PostActions";
import { resolveIpfsPost } from "../lib/ipfs";

type PostCardProps = {
  author: string;
  postId: number;
  contentCid: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  footer?: ReactNode;
  linkTo?: string;
  defaultCommentOpen?: boolean;
};

export const PostCard = ({
  author,
  postId,
  contentCid,
  createdAt,
  likeCount,
  commentCount,
  footer,
  linkTo,
  defaultCommentOpen = false,
}: PostCardProps) => {
  const router = useRouter();
  const [content, setContent] = useState<string | null>(null);
  const [imageCid, setImageCid] = useState<string | null>(null);
  const [contentError, setContentError] = useState(false);

  console.log("PostCard mounted with contentCid:", postId, contentCid);

  useEffect(() => {
    let active = true;
    setContent(null);
    setContentError(false);
    resolveIpfsPost(contentCid)
      .then((resolved) => {
        if (!active) return;
        setContent(resolved.content);
        setImageCid(resolved.imageCid || null);
      })
      .catch(() => {
        if (active) setContentError(true);
      });
    return () => {
      active = false;
    };
  }, [contentCid]);

  const handleNavigate = (event: React.MouseEvent) => {
    if (!linkTo) return;
    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        "button, a, input, textarea, select, label, [data-no-nav]"
      )
    ) {
      return;
    }
    router.push(linkTo);
  };

  return (
    <article
      onClick={handleNavigate}
      className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition ${
        linkTo ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg" : ""
      }`}
    >
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
        {imageCid ? (
          <img
            src={`${
              process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
              "https://gateway.pinata.cloud/ipfs"
            }/${imageCid}`}
            alt="Post image"
            className="mx-auto mt-3 max-h-[100px] w-auto rounded-2xl border border-zinc-200 object-contain"
          />
        ) : null}
      </div>
      <PostActions
        author={author}
        postId={postId}
        likeCount={likeCount}
        commentCount={commentCount}
        defaultCommentOpen={defaultCommentOpen}
      />
      {footer ? <div className="mt-4">{footer}</div> : null}
    </article>
  );
};
