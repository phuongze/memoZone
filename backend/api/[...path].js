const app = require("../src/app");
const { connectMongoIfNeeded } = require("../src/utils/mongo");

module.exports = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: "Missing JWT_SECRET in environment." });
      return;
    }

    await connectMongoIfNeeded();
    return app(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};