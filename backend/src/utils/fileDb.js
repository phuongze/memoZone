const mongoose = require("mongoose");

const isMongoEnabled =
  String(process.env.USE_MONGO || "false").toLowerCase() === "true";

let connectPromise = null;

async function connectMongoIfNeeded() {
  if (!isMongoEnabled) return false;

  if (!process.env.MONGODB_URI) {
    throw new Error("USE_MONGO=true nhưng chưa có MONGODB_URI");
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  await connectPromise;
  console.log("✅ MongoDB connected");

  return true;
}

module.exports = {
  connectMongoIfNeeded,
  isMongoEnabled,
};