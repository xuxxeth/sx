import dotenv from "dotenv";
import app from "./app";
import { connectDb } from "./services/db";
import { startIndexerWorker } from "./services/indexer-worker";

dotenv.config();

const port = Number(process.env.PORT || 4000);

const start = async () => {
  await connectDb();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${port}`);
  });
  startIndexerWorker();
};

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start API", err);
  process.exit(1);
});
