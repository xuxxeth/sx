"use client";

import { useWallet } from "@solana/wallet-adapter-react";

const shorten = (value: string) =>
  `${value.slice(0, 4)}...${value.slice(-4)}`;

export const WalletStatus = () => {
  const { publicKey } = useWallet();

  if (!publicKey) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 text-xs text-zinc-500">
        Wallet not connected.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
        Connected Wallet
      </p>
      <p className="mt-2 font-mono text-sm text-zinc-700">
        {shorten(publicKey.toBase58())}
      </p>
      <p className="mt-1 text-xs text-zinc-400">
        {publicKey.toBase58()}
      </p>
    </div>
  );
};
