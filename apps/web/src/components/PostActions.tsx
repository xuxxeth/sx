"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3, BN } from "@coral-xyz/anchor";
import {
  getProgram,
  deriveFollowPda,
  deriveTipPda,
  deriveLikePda,
  deriveCommentPda,
} from "../lib/anchor";
import { pinJsonContent, resolveIpfsContent } from "../lib/ipfs";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

const replayLimit = Number(
  process.env.NEXT_PUBLIC_INDEXER_REPLAY_LIMIT || 10
);

const defaultTipSol = 0.01;


type PostActionsProps = {
  author: string;
  postId: number;
  likeCount?: number;
  commentCount?: number;
};

export const PostActions = ({
  author,
  postId,
  likeCount = 0,
  commentCount = 0,
}: PostActionsProps) => {
  const wallet = useWallet();
  const [following, setFollowing] = useState(false);
  const [checking, setChecking] = useState(false);
  const [pending, setPending] = useState(false);
  const [tipSol, setTipSol] = useState(defaultTipSol);
  const [status, setStatus] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [commentBodies, setCommentBodies] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState(false);
  const [localCommentCount, setLocalCommentCount] = useState(commentCount);

  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://devnet.helius-rpc.com/?api-key=38ea0cc3-608b-4420-b7e7-d47541528846",
    []
  );

  const refreshStatus = async () => {
    if (!wallet.publicKey) {
      setFollowing(false);
      setLiked(false);
      return;
    }
    setChecking(true);
    try {
      const res = await fetch(
        `${apiBase}/follows/status?follower=${wallet.publicKey.toBase58()}&following=${author}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setFollowing(Boolean(data?.data?.following));
      const likeRes = await fetch(
        `${apiBase}/likes/status?liker=${wallet.publicKey.toBase58()}&author=${author}&postId=${postId}`,
        { cache: "no-store" }
      );
      const likeData = await likeRes.json();
      setLiked(Boolean(likeData?.data?.liked));
    } catch (_) {
      setFollowing(false);
      setLiked(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [wallet.publicKey, author]);

  useEffect(() => {
    setLocalLikeCount(likeCount);
  }, [likeCount]);

  useEffect(() => {
    setLocalCommentCount(commentCount);
  }, [commentCount]);

  const triggerSync = async () => {
    await fetch("/api/index/replay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ limit: replayLimit }),
    }).catch(() => null);
  };

  const toggleFollow = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (wallet.publicKey.toBase58() === author) {
      setStatus("Cannot follow yourself.");
      return;
    }

    try {
      setPending(true);
      setStatus(following ? "Unfollowing..." : "Following...");
      const program = await getProgram(wallet as any, endpoint);
      const [followPda] = deriveFollowPda(wallet.publicKey, new web3.PublicKey(author));

      if (following) {
        await program.methods
          .unfollow()
          .accounts({
            follower: wallet.publicKey,
            following: new web3.PublicKey(author),
            follow: followPda,
          })
          .rpc();
      } else {
        await program.methods
          .follow()
          .accounts({
            follower: wallet.publicKey,
            following: new web3.PublicKey(author),
            follow: followPda,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      }

      await triggerSync();
      setFollowing(!following);
      setStatus(null);
    } catch (err: any) {
      setStatus(err?.message || "Failed to update follow.");
    } finally {
      setPending(false);
    }
  };

  const sendTip = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!tipSol || tipSol <= 0) {
      setStatus("Enter tip amount.");
      return;
    }
    try {
      setPending(true);
      setStatus("Sending tip...");
      const program = await getProgram(wallet as any, endpoint);
      const lamports = Math.round(tipSol * web3.LAMPORTS_PER_SOL);
      const tipId = Date.now();
      const [tipPda] = deriveTipPda(wallet.publicKey, tipId);

      await program.methods
        .tip(new BN(tipId), new BN(lamports))
        .accounts({
          from: wallet.publicKey,
          to: new web3.PublicKey(author),
          tipRecord: tipPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      await triggerSync();
      setStatus("Tip sent.");
    } catch (err: any) {
      setStatus(err?.message || "Failed to send tip.");
    } finally {
      setPending(false);
    }
  };

  const toggleLike = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    try {
      setPending(true);
      setStatus(liked ? "Unliking..." : "Liking...");
      const program = await getProgram(wallet as any, endpoint);
      const [likePda] = deriveLikePda(
        wallet.publicKey,
        new web3.PublicKey(author),
        postId
      );

      if (liked) {
        await program.methods
          .unlikePost()
          .accounts({
            liker: wallet.publicKey,
            postAuthor: new web3.PublicKey(author),
            like: likePda,
          })
          .rpc();
      } else {
        await program.methods
          .likePost(new BN(postId))
          .accounts({
            liker: wallet.publicKey,
            postAuthor: new web3.PublicKey(author),
            like: likePda,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      }

      await triggerSync();
      setLiked(!liked);
      setLocalLikeCount((prev) => Math.max(0, prev + (liked ? -1 : 1)));
      setStatus(null);
    } catch (err: any) {
      setStatus(err?.message || "Failed to update like.");
    } finally {
      setPending(false);
    }
  };

  const loadComments = async () => {
    setCommentLoading(true);
    try {
      const res = await fetch(
        `${apiBase}/comments/${author}/${postId}?limit=20&offset=0`,
        { cache: "no-store" }
      );
      const data = await res.json();
      const items = data?.data || [];
      setComments(items);
      const entries = await Promise.all(
        items.map(async (item: any) => {
          try {
            const text = await resolveIpfsContent(item.contentCid);
            return [item._id, text] as const;
          } catch {
            return [item._id, "Content unavailable."] as const;
          }
        })
      );
      setCommentBodies(Object.fromEntries(entries));
    } catch (_) {
      setComments([]);
      setCommentBodies({});
    } finally {
      setCommentLoading(false);
    }
  };

  const submitComment = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!commentText.trim()) {
      setStatus("Comment cannot be empty.");
      return;
    }
    try {
      setPending(true);
      setStatus("Submitting comment...");
      const program = await getProgram(wallet as any, endpoint);
      const commentId = Date.now();
      const [commentPda] = deriveCommentPda(wallet.publicKey, postId, commentId);
      const contentCid = await pinJsonContent(commentText, "comment");

      await program.methods
        .createComment(new BN(postId), new BN(commentId), contentCid)
        .accounts({
          author: wallet.publicKey,
          postAuthor: new web3.PublicKey(author),
          comment: commentPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      await triggerSync();
      setCommentText("");
      setLocalCommentCount((prev) => prev + 1);
      await loadComments();
      setStatus("Comment posted.");
    } catch (err: any) {
      setStatus(err?.message || "Failed to post comment.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mt-3 space-y-3 text-xs text-zinc-500">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleFollow}
          disabled={pending || checking}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          {checking ? "Checking..." : following ? "Unfollow" : "Follow"}
        </button>
        <button
          onClick={toggleLike}
          disabled={pending || checking}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          {liked ? "Unlike" : "Like"} · {localLikeCount}
        </button>
        <button
          onClick={() => {
            const next = !commentOpen;
            setCommentOpen(next);
            if (next) loadComments();
          }}
          disabled={pending}
          className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700"
        >
          Comments · {localCommentCount}
        </button>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            value={tipSol}
            onChange={(event) => setTipSol(Number(event.target.value))}
            className="w-20 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700"
          />
          <button
            onClick={sendTip}
            disabled={pending}
            className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold text-zinc-700"
          >
            Tip SOL
          </button>
        </div>
        {status ? <span className="text-xs text-amber-600">{status}</span> : null}
      </div>
      {commentOpen ? (
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment..."
              className="flex-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-700"
            />
            <button
              onClick={submitComment}
              disabled={pending}
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Reply
            </button>
          </div>
          <div className="mt-3 space-y-2 text-xs text-zinc-600">
            {commentLoading ? <p>Loading...</p> : null}
            {!commentLoading && comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : null}
            {comments.map((comment) => (
              <div key={comment._id} className="rounded-xl bg-white p-2">
                <p className="text-[11px] text-zinc-400">{comment.author}</p>
                <p className="text-[11px] text-zinc-600">
                  {commentBodies[comment._id] || "Loading..."}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
