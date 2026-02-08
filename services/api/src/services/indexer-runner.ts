import { PublicKey } from "@solana/web3.js";
import { getProgramId, getSolanaConnection } from "./solana-client";
import {
  parseEventsFromLogs,
  parseInstructionsFromTransaction,
} from "./indexer-parser";
import { applyIndexedEvents } from "./indexer-handlers";
import { setIndexerState } from "./indexer-state";

export const runIndexerOnce = async (options: {
  beforeSignature?: string;
  limit?: number;
  commitment?: "processed" | "confirmed" | "finalized";
}) => {
  const programId = getProgramId();
  if (!programId) {
    throw new Error("SOLANA_PROGRAM_ID not set");
  }

  const connection = getSolanaConnection();
  const commitment = options.commitment ?? "confirmed";

  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(programId),
    { limit: options.limit ?? 100, before: options.beforeSignature },
    commitment
  );

  let processed = 0;
  for (const sigInfo of signatures) {
    if (sigInfo.err) continue;

    const tx = await connection.getTransaction(sigInfo.signature, {
      commitment,
      maxSupportedTransactionVersion: 0,
    });

    if (!tx?.meta?.logMessages) continue;

    let events = parseEventsFromLogs(
      connection,
      new PublicKey(programId),
      tx.meta.logMessages
    );

    if (events.length === 0) {
      events = parseInstructionsFromTransaction(
        new PublicKey(programId),
        tx
      );
    }

    if (process.env.INDEXER_DEBUG === "true" && events.length) {
      // eslint-disable-next-line no-console
      console.log(
        "Indexer: parsed signature",
        sigInfo.signature,
        events.map((event) => event.type)
      );
    }

    if (events.length === 0) {
      // eslint-disable-next-line no-console
      console.log(
        "Indexer: no events parsed",
        JSON.stringify({
          signature: sigInfo.signature,
          slot: sigInfo.slot,
          logs: tx.meta.logMessages?.slice(0, 12) || [],
        })
      );
    }

    if (events.length) {
      await applyIndexedEvents(events, sigInfo.signature);
      processed += events.length;
    }

    await setIndexerState("default", {
      lastSlot: sigInfo.slot,
      lastSignature: sigInfo.signature,
    });
  }

  return { processed, signatures: signatures.length };
};

export const runIndexerForSignature = async (
  signature: string,
  commitment?: "processed" | "confirmed" | "finalized"
) => {
  const programId = getProgramId();
  if (!programId) {
    throw new Error("SOLANA_PROGRAM_ID not set");
  }
  const connection = getSolanaConnection();
  const finalCommitment = commitment ?? "confirmed";

  const tx = await connection.getTransaction(signature, {
    commitment: finalCommitment,
    maxSupportedTransactionVersion: 0,
  });

  if (!tx?.meta?.logMessages) {
    return { processed: 0, signatures: 0 };
  }

  let events = parseEventsFromLogs(
    connection,
    new PublicKey(programId),
    tx.meta.logMessages
  );
  if (events.length === 0) {
    events = parseInstructionsFromTransaction(new PublicKey(programId), tx);
  }

  if (process.env.INDEXER_DEBUG === "true") {
    // eslint-disable-next-line no-console
    console.log(
      "Indexer: parsed signature",
      signature,
      events.map((event) => event.type)
    );
  }

  if (events.length) {
    await applyIndexedEvents(events, signature);
  }

  return { processed: events.length, signatures: 1 };
};
