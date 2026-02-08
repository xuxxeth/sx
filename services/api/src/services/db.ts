import mongoose from "mongoose";

const resolveMongoUri = () => {
  const base = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/sx";
  const port = process.env.MONGODB_PORT;
  if (!port) {
    return base;
  }
  try {
    const url = new URL(base);
    url.port = port;
    return url.toString();
  } catch {
    return base;
  }
};

export const connectDb = async () => {
  const uri = resolveMongoUri();
  await mongoose.connect(uri);
};
