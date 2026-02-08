"use client";

import { PublicKey } from "@solana/web3.js";

const storageKey = "sx_auth_token";
const expKey = "sx_auth_exp";
const addrKey = "sx_auth_addr";

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export const getToken = () => {
  const token = localStorage.getItem(storageKey);
  const exp = Number(localStorage.getItem(expKey) || 0);
  const address = localStorage.getItem(addrKey) || "";
  return { token, exp, address };
};

export const clearToken = () => {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(expKey);
  localStorage.removeItem(addrKey);
};

export const isTokenValid = (token: string | null, exp: number) => {
  if (!token || !exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp > now + 30;
};

export const ensureAuth = async (
  address: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
) => {
  const stored = getToken();
  if (stored.address === address && isTokenValid(stored.token, stored.exp)) {
    return stored.token as string;
  }

  const challengeRes = await fetch(`${apiBase}/auth/challenge`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address }),
  });
  const challengeData = await challengeRes.json();
  if (!challengeRes.ok || !challengeData?.ok) {
    throw new Error(challengeData?.error || "Failed to get challenge.");
  }

  const message = challengeData.data.message as string;
  const signatureBytes = await signMessage(new TextEncoder().encode(message));
  const signature = btoa(
    String.fromCharCode(...Array.from(signatureBytes))
  );

  const verifyRes = await fetch(`${apiBase}/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, message, signature }),
  });
  const verifyData = await verifyRes.json();
  if (!verifyRes.ok || !verifyData?.ok) {
    throw new Error(verifyData?.error || "Failed to verify signature.");
  }

  const token = verifyData.data.token as string;
  const exp = Number(verifyData.data.exp || 0);
  localStorage.setItem(storageKey, token);
  localStorage.setItem(expKey, String(exp));
  localStorage.setItem(addrKey, address);
  return token;
};

export const authFetch = async (input: RequestInfo, init: RequestInit = {}) => {
  const { token, exp } = getToken();
  if (!isTokenValid(token, exp)) {
    throw new Error("Auth token expired. Reconnect wallet.");
  }
  const headers = new Headers(init.headers || {});
  headers.set("authorization", `Bearer ${token}`);
  return fetch(input, { ...init, headers });
};

export const normalizeAddress = (value: string) => {
  try {
    return new PublicKey(value).toBase58();
  } catch {
    return value;
  }
};
