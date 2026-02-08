"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const AuthorityInput = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("authority") || "");

  const submit = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("authority", value);
    } else {
      params.delete("authority");
    }
    params.delete("offset");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Authority address"
        className="flex-1 rounded-full border border-zinc-300 px-4 py-2 text-xs text-zinc-700"
      />
      <button
        onClick={submit}
        className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700"
      >
        Load
      </button>
    </div>
  );
};
