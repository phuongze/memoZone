const mongoose = require("mongoose");

const isMongoEnabled = String(process.env.USE_MONGO || "false").toLowerCase() === "true";

let connectPromise = null;

async function connectMongoIfNeeded() {
  if (!isMongoEnabled) return false;

  if (!process.env.MONGODB_URI) {
    throw new Error("USE_MONGO=true nhung chua co MONGODB_URI");
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(process.env.MONGODB_URI);
  }

  await connectPromise;
  return true;
}

module.exports = {
  connectMongoIfNeeded,
  isMongoEnabled,
};