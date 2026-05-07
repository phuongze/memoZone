const { updateWishDetailsRoute } = require("../../../src/serverless/http");

module.exports = async function handler(req, res) {
  const { id } = req.query;
  return updateWishDetailsRoute(req, res, id);
};
