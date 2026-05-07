const { getProfile, patchProfile } = require("../src/serverless/http");

module.exports = async function handler(req, res) {
  if (req.method === "GET" || req.method === "OPTIONS") {
    return getProfile(req, res);
  }

  if (req.method === "PATCH") {
    return patchProfile(req, res);
  }

  return res.status(405).json({ message: "Method Not Allowed" });
};
