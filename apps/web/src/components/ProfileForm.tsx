"use client";

import { useMemo, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { web3 } from "@coral-xyz/anchor";
import { useRouter } from "next/navigation";
import { deriveProfilePda, deriveUsernamePda, getProgram } from "../lib/anchor";
import { StatusToast } from "./StatusToast";
import { ErrorHint } from "./ErrorHint";
import { CONSTRAINTS } from "../lib/constraints";
import { isValidCid, isValidDisplayName, isValidUsername } from "../lib/validators";

const replayLimit = Number(
  process.env.NEXT_PUBLIC_INDEXER_REPLAY_LIMIT || 10
);

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export const ProfileForm = () => {
  const wallet = useWallet();
  const router = useRouter();
  const [currentUsername, setCurrentUsername] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bioCid, setBioCid] = useState("");
  const [avatarCid, setAvatarCid] = useState("");
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

  const loadFromApi = async () => {
    if (!wallet.publicKey) return;
    try {
      const res = await fetch(
        `${apiBase}/profiles/${wallet.publicKey.toBase58()}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.ok && data.data) {
        const profile = data.data;
        setCurrentUsername(profile.username || "");
        setUsername(profile.username || "");
        setDisplayName(profile.displayName || "");
        setBioCid(profile.bioCid || "");
        setAvatarCid(profile.avatarCid || "");
        setStatus("Loaded profile from API.");
      }
    } catch (err: any) {
      setStatus("Failed to load from API.");
    }
  };

  const loadFromChain = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }

    try {
      setPending(true);
      setError(null);
      setStatus("Loading profile from chain...");
      const program = await getProgram(wallet as any, endpoint);
      const [profilePda] = deriveProfilePda(wallet.publicKey);
      const account = await program.account.userProfile.fetch(profilePda);
      setCurrentUsername(account.username);
      setUsername(account.username);
      setDisplayName(account.displayName);
      setBioCid(account.bioCid);
      setAvatarCid(account.avatarCid);
      setStatus("Loaded profile from chain.");
    } catch (err: any) {
      const message = err?.message || "Failed to load profile from chain.";
      setError(message);
      setStatus(message);
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    loadFromApi();
  }, [wallet.publicKey]);

  const triggerSync = async (message: string, txSignature?: string) => {
    setStatus(message);
    setSignature(txSignature || null);
    await fetch("/api/index/replay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ limit: replayLimit }),
    }).catch(() => null);
    setStatus(`${message} Indexer sync triggered.`);
    router.refresh();
  };

  const createProfile = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!isValidUsername(username)) {
      setStatus(`Username required. Max ${CONSTRAINTS.usernameMax} chars.`);
      return;
    }
    if (!isValidDisplayName(displayName)) {
      setStatus(`Display name required. Max ${CONSTRAINTS.displayNameMax} chars.`);
      return;
    }
    if (!isValidCid(bioCid) || !isValidCid(avatarCid)) {
      setStatus(`Bio/Avatar CID required. Max ${CONSTRAINTS.cidMax} chars.`);
      return;
    }

    try {
      setPending(true);
      setSignature(null);
      setError(null);
      setStatus("Creating profile...");
      const program = await getProgram(wallet as any, endpoint);
      const [profilePda] = deriveProfilePda(wallet.publicKey);
      const [usernamePda] = deriveUsernamePda(username);

      const tx = await program.methods
        .createProfile(username, displayName, bioCid, avatarCid)
        .accounts({
          authority: wallet.publicKey,
          profile: profilePda,
          usernameRecord: usernamePda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      await triggerSync(`Profile created: ${tx}.`, tx);
    } catch (err: any) {
      const message = err?.message || "Failed to create profile.";
      setError(message);
      setStatus(message);
    } finally {
      setPending(false);
    }
  };

  const updateProfile = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!isValidDisplayName(displayName)) {
      setStatus(`Display name required. Max ${CONSTRAINTS.displayNameMax} chars.`);
      return;
    }
    if (!isValidCid(bioCid) || !isValidCid(avatarCid)) {
      setStatus(`Bio/Avatar CID required. Max ${CONSTRAINTS.cidMax} chars.`);
      return;
    }
    try {
      setPending(true);
      setSignature(null);
      setError(null);
      setStatus("Updating profile...");
      const program = await getProgram(wallet as any, endpoint);
      const [profilePda] = deriveProfilePda(wallet.publicKey);

      const tx = await program.methods
        .updateProfile(displayName, bioCid, avatarCid)
        .accounts({
          authority: wallet.publicKey,
          profile: profilePda,
        })
        .rpc();

      await triggerSync(`Profile updated: ${tx}.`, tx);
    } catch (err: any) {
      const message = err?.message || "Failed to update profile.";
      setError(message);
      setStatus(message);
    } finally {
      setPending(false);
    }
  };

  const updateUsername = async () => {
    if (!wallet.publicKey) {
      setStatus("Connect wallet first.");
      return;
    }
    if (!currentUsername || !isValidUsername(username)) {
      setStatus(`Current and new username required. Max ${CONSTRAINTS.usernameMax} chars.`);
      return;
    }

    try {
      setPending(true);
      setSignature(null);
      setError(null);
      setStatus("Updating username...");
      const program = await getProgram(wallet as any, endpoint);
      const [profilePda] = deriveProfilePda(wallet.publicKey);
      const [oldUsernamePda] = deriveUsernamePda(currentUsername);
      const [newUsernamePda] = deriveUsernamePda(username);

      const tx = await program.methods
        .updateUsername(username)
        .accounts({
          authority: wallet.publicKey,
          profile: profilePda,
          oldUsernameRecord: oldUsernamePda,
          newUsernameRecord: newUsernamePda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      await triggerSync(`Username updated: ${tx}.`, tx);
    } catch (err: any) {
      const message = err?.message || "Failed to update username.";
      setError(message);
      setStatus(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={loadFromApi}
          disabled={pending}
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
        >
          Load from API
        </button>
        <button
          onClick={loadFromChain}
          disabled={pending}
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold"
        >
          Load from Chain
        </button>
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Current Username (for rename)
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
          value={currentUsername}
          maxLength={CONSTRAINTS.usernameMax}
          onChange={(event) => setCurrentUsername(event.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Username
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
          value={username}
          maxLength={CONSTRAINTS.usernameMax}
          onChange={(event) => setUsername(event.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Display Name
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
          value={displayName}
          maxLength={CONSTRAINTS.displayNameMax}
          onChange={(event) => setDisplayName(event.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Bio CID
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
          value={bioCid}
          maxLength={CONSTRAINTS.cidMax}
          onChange={(event) => setBioCid(event.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-zinc-400">
          Avatar CID
        </label>
        <input
          className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-xs text-zinc-700"
          value={avatarCid}
          maxLength={CONSTRAINTS.cidMax}
          onChange={(event) => setAvatarCid(event.target.value)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <button
          onClick={createProfile}
          disabled={pending}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
        >
          {pending ? "Working..." : "Create"}
        </button>
        <button
          onClick={updateProfile}
          disabled={pending}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold"
        >
          {pending ? "Working..." : "Update"}
        </button>
        <button
          onClick={updateUsername}
          disabled={pending}
          className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold"
        >
          {pending ? "Working..." : "Rename"}
        </button>
      </div>
      <ErrorHint error={error} />
      <StatusToast status={status} signature={signature} />
    </div>
  );
};
