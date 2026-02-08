"use client";

import { useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3, BN } from "@coral-xyz/anchor";
import { useRouter } from "next/navigation";
import { getProgram, derivePostPda, deriveTopicPda } from "../lib/anchor";
import { StatusToast } from "./StatusToast";
import { ErrorHint } from "./ErrorHint";
import { CONSTRAINTS } from "../lib/constraints";
import { pinJsonContent } from "../lib/ipfs";

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

  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://devnet.helius-rpc.com/?api-key=38ea0cc3-608b-4420-b7e7-d47541528846",
    []
  );

  const handleContentChange = (value: string) => {
    setContentText(value);
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
    const cid = await pinJsonContent(contentText, "post");
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
      router.refresh();
    } catch (err: any) {
      const message = err?.message || "Failed to submit transaction.";
      setError(message);
      setStatus(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Content
        </label>
        <textarea
          className="mt-2 h-28 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-sm text-zinc-700"
          placeholder="What's happening? Share your update..."
          value={contentText}
          onChange={(event) => handleContentChange(event.target.value)}
        />
    </div>
      <button
        onClick={submit}
        disabled={pending}
        className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white"
      >
        {pending ? "Submitting..." : "Post"}
      </button>
      <ErrorHint error={error} />
      <StatusToast status={status} signature={signature} />
    </div>
  );
};
