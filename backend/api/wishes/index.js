const { listWishItems, createWishItem } = require("../../src/serverless/http");

module.exports = async function handler(req, res) {
  if (req.method === "GET" || req.method === "OPTIONS") {
    return listWishItems(req, res);
  }

  if (req.method === "POST") {
    return createWishItem(req, res);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
};
