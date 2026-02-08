"use client";

import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const WalletConnect = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700">
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="wallet-connect">
      <WalletMultiButton />
    </div>
  );
};
