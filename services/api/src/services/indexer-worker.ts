import { getIndexerState } from "./indexer-state";
import { runIndexerOnce } from "./indexer-runner";

const intervalMs = Number(process.env.INDEXER_POLL_MS || 15000);
const lookbackLimit = Number(process.env.INDEXER_LOOKBACK_LIMIT || 100);
const commitment = (process.env.INDEXER_COMMITMENT || "confirmed") as
  | "processed"
  | "confirmed"
  | "finalized";

export const startIndexerWorker = () => {
  if (process.env.ENABLE_INDEXER_WORKER !== "true") {
    return;
  }

  // eslint-disable-next-line no-console
  console.log("Indexer worker started");

  setInterval(async () => {
    try {
      const state = await getIndexerState("default");
      await runIndexerOnce({
        beforeSignature: state?.lastSignature,
        limit: lookbackLimit,
        commitment,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Indexer tick failed", err);
    }
  }, intervalMs);
};
