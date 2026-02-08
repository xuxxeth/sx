import mongoose, { Schema } from "mongoose";

const indexerStateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    lastSlot: { type: Number, required: true },
    lastSignature: { type: String },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const IndexerStateModel =
  mongoose.models.IndexerState ||
  mongoose.model("IndexerState", indexerStateSchema);

export const getIndexerState = async (key: string) =>
  IndexerStateModel.findOne({ key }).lean();

export const setIndexerState = async (
  key: string,
  data: { lastSlot: number; lastSignature?: string }
) =>
  IndexerStateModel.findOneAndUpdate(
    { key },
    { ...data, updatedAt: new Date() },
    { upsert: true, new: true }
  ).lean();
