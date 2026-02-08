"use client";

import { useState } from "react";

export const CidHelper = ({ onSelect }: { onSelect: (cid: string) => void }) => {
  const [text, setText] = useState("");
  const [cid, setCid] = useState<string | null>(null);

  const generate = async () => {
    if (!text.trim()) {
      setCid(null);
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim());
    const digest = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(digest));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const fakeCid = `sha256:${hashHex}`;
    setCid(fakeCid);
    onSelect(fakeCid);
  };

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        CID Helper (Mock)
      </p>
      <p className="mt-2 text-xs text-zinc-500">
        Paste text and generate a deterministic SHA-256 CID for testing.
      </p>
      <textarea
        className="mt-3 h-24 w-full rounded-xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Draft content to hash..."
      />
      <button
        onClick={generate}
        className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white"
      >
        Generate CID
      </button>
      {cid ? (
        <p className="mt-3 break-all font-mono text-xs text-zinc-600">{cid}</p>
      ) : null}
    </div>
  );
};
