const { health } = require("../src/serverless/http");

module.exports = async (req, res) => {
    return health(req, res);
};
