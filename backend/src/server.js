const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");
const authMiddleware = require("./middleware/auth");
const { connectMongoIfNeeded } = require("./utils/mongo");
const {
  listWishes,
  createWish,
  updateWishDetails,
  updateWishStatus,
} = require("./services/wishStore");
const {
  loadCounterData,
  saveCounterData,
} = require("./services/counterStore");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function buildMilestones(startDate) {
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return [];

  const dayMilestones = [7, 30, 100, 365, 730];
  const now = Date.now();

  return dayMilestones.map((days) => {
    const milestoneDate = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);
    return {
      days,
      date: milestoneDate.toISOString(),
      reached: now >= milestoneDate.getTime(),
    };
  });
}

const allowedUsers = [
  {
    username: process.env.USER_ONE_NAME || "memory_admin",
    passwordHash:
      process.env.USER_ONE_HASH ||
      "$2b$10$62IKeZ15DgeLIyzKw4T80OymIAvI3kXf1Ql2oC3w.8kMd5YEvw.u.",
  },
  {
    username: process.env.USER_TWO_NAME || "love_guest",
    passwordHash:
      process.env.USER_TWO_HASH ||
      "$2b$10$8mQTy6hGU8mjl1usSUWefufAbhExLoqPh.OBYaGakvdojRsJo5bvC",
  },
];

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Please provide username and password" });
  }

  const matchedUser = allowedUsers.find((user) => user.username === username);

  if (!matchedUser) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  const isValidPassword = await bcrypt.compare(password, matchedUser.passwordHash);

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  const token = jwt.sign(
    { username: matchedUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "12h" },
  );

  return res.json({
    token,
    user: { username: matchedUser.username },
  });
});

app.get("/api/wishes", authMiddleware, async (_req, res) => {
  const wishes = await listWishes();
  return res.json(wishes);
});

app.post("/api/wishes", authMiddleware, async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  const created = await createWish(req.body);
  return res.status(201).json(created);
});

app.patch("/api/wishes/:id/details", authMiddleware, async (req, res) => {
  try {
    const updated = await updateWishDetails(req.params.id, req.body);

    if (!updated) {
      return res.status(404).json({ message: "Wish not found" });
    }

    return res.json(updated);
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }

    throw error;
  }
});

app.patch("/api/wishes/:id", authMiddleware, async (req, res) => {
  const { isCompleted, completionData } = req.body;
  const updated = await updateWishStatus(req.params.id, isCompleted, completionData);

  if (!updated) {
    return res.status(404).json({ message: "Wish not found" });
  }

  return res.json(updated);
});

app.get("/api/counter", authMiddleware, async (req, res) => {
  const members = allowedUsers.map((user) => user.username);
  const counterData = await loadCounterData(members);

  return res.json({
    ...counterData,
    milestones: buildMilestones(counterData.startDate),
    pendingForMe: (counterData.invites || []).filter(
      (invite) => invite.to === req.user.username && invite.status === "pending",
    ),
  });
});

app.patch("/api/counter", authMiddleware, async (req, res) => {
  const members = allowedUsers.map((user) => user.username);
  const counterData = await loadCounterData(members);

  const nextStartDate = req.body.startDate;
  const nextCoupleName = req.body.coupleName;

  if (nextStartDate) {
    const parsed = new Date(nextStartDate);
    if (Number.isNaN(parsed.getTime())) {
      return res.status(400).json({ message: "Invalid startDate" });
    }
    counterData.startDate = nextStartDate;
  }

  if (nextCoupleName && String(nextCoupleName).trim()) {
    counterData.coupleName = String(nextCoupleName).trim();
  }

  await saveCounterData(counterData, members);

  return res.json({
    ...counterData,
    milestones: buildMilestones(counterData.startDate),
  });
});

app.post("/api/counter/invites", authMiddleware, async (req, res) => {
  const members = allowedUsers.map((user) => user.username);
  const counterData = await loadCounterData(members);
  const from = req.user.username;
  const to = members.find((username) => username !== from);
  const proposedAt = req.body.proposedAt;
  const note = req.body.note || "";

  if (!to) {
    return res.status(400).json({ message: "Recipient not found" });
  }

  const parsed = new Date(proposedAt);
  if (!proposedAt || Number.isNaN(parsed.getTime())) {
    return res.status(400).json({ message: "Invalid proposedAt" });
  }

  const invite = {
    id: `inv_${Date.now()}`,
    code: generateInviteCode(),
    from,
    to,
    proposedAt,
    note,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  counterData.invites = [invite, ...(counterData.invites || [])].slice(0, 30);
  await saveCounterData(counterData, members);

  return res.status(201).json(invite);
});

app.patch("/api/counter/invites/:id", authMiddleware, async (req, res) => {
  const members = allowedUsers.map((user) => user.username);
  const counterData = await loadCounterData(members);
  const { id } = req.params;
  const { action, code } = req.body;

  const inviteIndex = (counterData.invites || []).findIndex((invite) => invite.id === id);
  if (inviteIndex < 0) {
    return res.status(404).json({ message: "Invite not found" });
  }

  const invite = counterData.invites[inviteIndex];

  if (invite.to !== req.user.username) {
    return res.status(403).json({ message: "You are not allowed to process this invite" });
  }

  if (invite.status !== "pending") {
    return res.status(400).json({ message: "Invite has already been processed" });
  }

  if (action === "accept") {
    if (!code || String(code).toUpperCase() !== invite.code) {
      return res.status(400).json({ message: "Invite code is incorrect" });
    }
    invite.status = "accepted";
    invite.respondedAt = new Date().toISOString();
    counterData.startDate = invite.proposedAt;
  } else if (action === "reject") {
    invite.status = "rejected";
    invite.respondedAt = new Date().toISOString();
  } else {
    return res.status(400).json({ message: "Invalid action" });
  }

  counterData.invites[inviteIndex] = invite;
  await saveCounterData(counterData, members);

  return res.json({
    invite,
    startDate: counterData.startDate,
    milestones: buildMilestones(counterData.startDate),
  });
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  const members = allowedUsers.map((user) => user.username);
  const counterData = await loadCounterData(members);

  const me = counterData.profiles[req.user.username];
  const partnerUsername = members.find((username) => username !== req.user.username);
  const partner = partnerUsername ? counterData.profiles[partnerUsername] : null;

  return res.json({ me, partner });
});

app.patch("/api/profile", authMiddleware, async (req, res) => {
  const members = allowedUsers.map((user) => user.username);
  const counterData = await loadCounterData(members);
  const currentProfile = counterData.profiles[req.user.username] || {
    username: req.user.username,
  };

  const payload = req.body || {};
  const avatarUrl =
    payload.avatarUrl === undefined
      ? (currentProfile.avatarUrl || "")
      : payload.avatarUrl?.toString() || "";

  if (avatarUrl.length > 1500000) {
    return res.status(400).json({ message: "Avatar image is too large" });
  }

  if (avatarUrl && !avatarUrl.startsWith("data:image/") && !avatarUrl.startsWith("http")) {
    return res.status(400).json({ message: "Invalid avatar image" });
  }

  const updatedProfile = {
    ...currentProfile,
    displayName: payload.displayName?.toString().trim() || currentProfile.displayName || req.user.username,
    roleLabel: payload.roleLabel?.toString().trim() || currentProfile.roleLabel || "Member",
    bio: payload.bio?.toString().trim() || "",
    favoriteDateSpot: payload.favoriteDateSpot?.toString().trim() || "",
    avatarUrl,
  };

  counterData.profiles[req.user.username] = updatedProfile;
  await saveCounterData(counterData, members);

  io.emit("profile:updated", {
    username: req.user.username,
    profile: updatedProfile,
    updatedAt: new Date().toISOString(),
  });

  const partnerUsername = members.find((username) => username !== req.user.username);
  const partner = partnerUsername ? counterData.profiles[partnerUsername] : null;

  return res.json({ me: updatedProfile, partner });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ message: "Server error" });
});

(async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET in environment.");
    }

    await connectMongoIfNeeded();
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Cannot start server", error.message);
    process.exit(1);
  }
})();
