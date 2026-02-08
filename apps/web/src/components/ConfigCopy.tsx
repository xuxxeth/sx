"use client";

import { useState } from "react";

type ConfigCopyProps = {
  label: string;
  value?: string | null;
};

export const ConfigCopy = ({ label, value }: ConfigCopyProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <p className="flex-1 break-all font-mono text-xs">
          {value || "(unset)"}
        </p>
        <button
          onClick={handleCopy}
          disabled={!value}
          className="rounded-full border border-zinc-300 px-3 py-1 text-[10px] font-semibold text-zinc-600"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};
