"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3, BN } from "@coral-xyz/anchor";
import { useRouter } from "next/navigation";
import { getProgram, derivePostPda, deriveTopicPda } from "../lib/anchor";
import { StatusToast } from "./StatusToast";
import { ErrorHint } from "./ErrorHint";
import { CONSTRAINTS } from "../lib/constraints";
import { pinPostContent, pinFileContent } from "../lib/ipfs";

const replayLimit = Number(
  process.env.NEXT_PUBLIC_INDEXER_REPLAY_LIMIT || 10
);

const extractTopics = (text: string) => {
  const matches = text.match(/#([a-zA-Z0-9_]{1,32})/g) || [];
  const topics = matches.map((tag) => tag.slice(1));
  return Array.from(new Set(topics));
};

export const ComposeForm = () => {
  const wallet = useWallet();
  const router = useRouter();
  const [contentText, setContentText] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://devnet.helius-rpc.com/?api-key=38ea0cc3-608b-4420-b7e7-d47541528846",
    []
  );

  const handleContentChange = (value: string) => {
    setContentText(value);
  };

  const handleImageSelect = (file: File | null) => {
    if (!file) {
      setImagePreview(null);
      setImageFile(null);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const submit = async () => {
    if (!process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID) {
      setStatus("Program ID missing. Set NEXT_PUBLIC_SOLANA_PROGRAM_ID.");
      return;
    }
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!contentText.trim()) {
      setStatus("Content is required.");
      return;
    }
    let imageCid: string | null = null;
    if (imageFile) {
      setUploading(true);
      setStatus("Uploading image...");
      imageCid = await pinFileContent(imageFile, imageFile.name);
    }
    setStatus("Uploading post content...");
    const cid = await pinPostContent(contentText, imageCid);
    if (cid.length > CONSTRAINTS.cidMax) {
      setStatus(`CID too long. Max ${CONSTRAINTS.cidMax} chars.`);
      return;
    }

    try {
      setPending(true);
      setSignature(null);
      setError(null);
      setStatus("Submitting transaction...");
      const program = await getProgram(wallet as any, endpoint);
      const postId = Date.now();
      const [postPda] = derivePostPda(wallet.publicKey, postId);

      const tx = await program.methods
        .createPostIndex(new BN(postId), cid, 0)
        .accounts({
          authority: wallet.publicKey,
          post: postPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setSignature(tx);
      setStatus(`Submitted: ${tx}. Indexing topics...`);

      const topics = extractTopics(contentText);
      for (const topic of topics) {
        const [topicPda] = deriveTopicPda(wallet.publicKey, postId, topic);
        await program.methods
          .indexTopic(new BN(postId), topic)
          .accounts({
            author: wallet.publicKey,
            topicAccount: topicPda,
            systemProgram: web3.SystemProgram.programId,
          })
          .rpc();
      }

      setStatus(`Submitted: ${tx}. Syncing indexer...`);

      await fetch("/api/index/replay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ limit: replayLimit }),
      }).catch(() => null);

      setStatus(`Submitted: ${tx}. Indexer sync triggered.`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("sx:feed-refresh"));
      }
      setContentText("");
      setImagePreview(null);
      setImageFile(null);
      router.refresh();
    } catch (err: any) {
      const message = err?.message || "Failed to submit transaction.";
      setError(message);
      setStatus(message);
    } finally {
      setPending(false);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-3">
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Content
        </label>
        {imagePreview ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="max-h-[100px] w-full object-contain"
            />
            <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-500">
              <span>Image attached</span>
              <button
                type="button"
                onClick={() => handleImageSelect(null)}
                className="rounded-full px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-100"
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}
        <textarea
          className="mt-3 h-28 w-full resize-none bg-transparent p-1 text-sm text-zinc-700 outline-none"
          placeholder="What's happening? Share your update..."
          value={contentText}
          onChange={(event) => handleContentChange(event.target.value)}
        />
        <div className="mt-3 flex items-center justify-between border-t border-zinc-200 pt-3 text-zinc-500">
          <div className="flex items-center gap-3">
            <label
              htmlFor="post-image"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
              title="Add image"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9" r="1.5" />
                <path d="M21 16l-5-5-4 4-2-2-5 5" />
              </svg>
            </label>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-400"
              title="GIF (soon)"
            >
              GIF
            </button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-400"
              title="Poll (soon)"
            >
              ···
            </button>
          </div>
          <input
            id="post-image"
            type="file"
            accept="image/*"
            onChange={(event) =>
              handleImageSelect(event.target.files?.[0] || null)
            }
            className="hidden"
          />
        </div>
      </div>
      <button
        onClick={submit}
        disabled={pending || uploading}
        className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
      >
        {pending ? "Submitting..." : uploading ? "Uploading..." : "Post"}
      </button>
      <ErrorHint error={error} />
      <StatusToast status={status} signature={signature} />
    </div>
  );
};
