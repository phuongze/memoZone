const { updateWish } = require("../../src/serverless/http");

module.exports = async function handler(req, res) {
  const { id } = req.query;
  return updateWish(req, res, id);
};
