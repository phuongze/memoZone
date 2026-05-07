const { handleInvite } = require("../../../src/serverless/http");

module.exports = async function handler(req, res) {
  const { id } = req.query;
  return handleInvite(req, res, id);
};
