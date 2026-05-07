const { login } = require("../../src/serverless/http");

// Vercel serverless handler
module.exports = async (req, res) => {
    return login(req, res);
};
