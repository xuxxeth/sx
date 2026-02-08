"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { CidHelper } from "./CidHelper";

export const ComposerInline = () => {
  const { publicKey } = useWallet();
  const [text, setText] = useState("");

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
          {publicKey ? publicKey.toBase58().slice(0, 2) : "GX"}
        </div>
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What’s happening?"
            className="w-full resize-none rounded-xl border border-transparent bg-zinc-50 p-3 text-sm text-zinc-700 outline-none focus:border-zinc-200"
            rows={3}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-zinc-400">
              {publicKey ? "Posting as connected wallet" : "Connect wallet to post"}
            </div>
            <Link
              href="/compose"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
            >
              Post
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <CidHelper onSelect={() => null} />
      </div>
    </div>
  );
};
