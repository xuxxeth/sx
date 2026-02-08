"use client";

import { useRouter } from "next/navigation";

export const RetryButton = ({ label = "Retry" }: { label?: string }) => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700"
    >
      {label}
    </button>
  );
};
