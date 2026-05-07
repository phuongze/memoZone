const { getCounter, patchCounter } = require("../../src/serverless/http");

module.exports = async function handler(req, res) {
  if (req.method === "GET" || req.method === "OPTIONS") {
    return getCounter(req, res);
  }

  if (req.method === "PATCH") {
    return patchCounter(req, res);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
};
