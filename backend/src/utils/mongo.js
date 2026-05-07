const mongoose = require("mongoose");

const isMongoEnabled = String(process.env.USE_MONGO || "false").toLowerCase() === "true";
const globalMongoCache = globalThis.__mongooseCache || (globalThis.__mongooseCache = {
  conn: null,
  promise: null,
});

async function connectMongoIfNeeded() {
  if (!isMongoEnabled) return false;

  if (!process.env.MONGODB_URI) {
    throw new Error("USE_MONGO=true nhung chua co MONGODB_URI");
  }

  if (globalMongoCache.conn) {
    return true;
  }

  if (!globalMongoCache.promise) {
    globalMongoCache.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  globalMongoCache.conn = await globalMongoCache.promise;
  return true;
}

module.exports = {
  connectMongoIfNeeded,
  isMongoEnabled,
};