import { Connection, PublicKey } from "@solana/web3.js";

export const getSolanaConnection = () => {
  const endpoint =
    process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const wsEndpoint = process.env.SOLANA_WS_URL;
  return new Connection(endpoint, {
    commitment: "confirmed",
    wsEndpoint: wsEndpoint || undefined,
  });
};

export const getProgramId = () => {
  const id = process.env.SOLANA_PROGRAM_ID;
  if (!id) {
    return null;
  }
  return new PublicKey(id);
};
