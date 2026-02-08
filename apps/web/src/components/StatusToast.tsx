"use client";

import Link from "next/link";
import { buildExplorerUrl } from "../lib/explorer";

type StatusToastProps = {
  status?: string | null;
  signature?: string | null;
};

export const StatusToast = ({ status, signature }: StatusToastProps) => {
  if (!status) return null;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 text-xs text-zinc-600 shadow-lg">
      <p>{status}</p>
      {signature ? (
        <Link
          href={buildExplorerUrl(signature)}
          className="mt-2 inline-flex text-xs font-semibold text-amber-600"
          target="_blank"
        >
          View on Explorer
        </Link>
      ) : null}
    </div>
  );
};
