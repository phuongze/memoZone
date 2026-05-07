const dotenv = require("dotenv");
const app = require("./app");
const { connectMongoIfNeeded } = require("./utils/mongo");

dotenv.config();

const PORT = process.env.PORT || 5000;

// Only start server locally, not on Vercel
if (process.env.NODE_ENV !== "production") {
  (async function startServer() {
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT_SECRET in environment.");
      }

      await connectMongoIfNeeded();
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("Cannot start server", error.message);
      process.exit(1);
    }
  })();
}