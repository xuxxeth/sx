"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ensureAuth, clearToken } from "../lib/auth";

export const WalletConnect = () => {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!wallet.publicKey) {
        clearToken();
        setStatus(null);
        return;
      }
      if (!wallet.signMessage) {
        setStatus("Wallet does not support message signing.");
        return;
      }
      try {
        setStatus("Signing...");
        await ensureAuth(wallet.publicKey.toBase58(), wallet.signMessage);
        setStatus(null);
      } catch (err: any) {
        setStatus(err?.message || "Auth failed.");
      }
    };
    run();
  }, [wallet.publicKey, wallet.signMessage]);

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
      {status ? (
        <p className="mt-2 text-[11px] text-amber-600">{status}</p>
      ) : null}
    </div>
  );
};
