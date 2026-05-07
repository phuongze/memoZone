const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectMongoIfNeeded, isMongoEnabled } = require("../utils/mongo");
const {
  ensureAuthUsersReady,
  findUserByUsername,
  listAllowedUsernames,
} = require("../services/authUserStore");
const {
  listWishes,
  createWish,
  updateWishDetails,
  updateWishStatus,
} = require("../services/wishStore");
const {
  loadCounterData,
  saveCounterData,
} = require("../services/counterStore");

function getAllowedOrigins() {
  const raw = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function setCorsHeaders(res) {
  const origins = getAllowedOrigins();
  const origin = origins[0] || "*";

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
}

function sendJson(res, statusCode, payload) {
  setCorsHeaders(res);
  res.status(statusCode).json(payload);
}

function handleOptions(res) {
  setCorsHeaders(res);
  return res.status(204).end();
}

function methodNotAllowed(res) {
  return sendJson(res, 405, { message: "Method Not Allowed" });
}

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

async function requireAuth(req, res) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    sendJson(res, 401, { message: "Unauthorized" });
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    sendJson(res, 401, { message: "Invalid token" });
    return null;
  }
}

async function login(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return methodNotAllowed(res);

  const { username, password } = req.body || {};

  if (!username || !password) {
    return sendJson(res, 400, { message: "Please provide username and password" });
  }

  if (isMongoEnabled) {
    await connectMongoIfNeeded();
    await ensureAuthUsersReady();
  }

  const matchedUser = await findUserByUsername(username);

  if (!matchedUser) {
    return sendJson(res, 401, { message: "Invalid login credentials" });
  }

  const isValidPassword = await bcrypt.compare(password, matchedUser.passwordHash);
  if (!isValidPassword) {
    return sendJson(res, 401, { message: "Invalid login credentials" });
  }

  const token = jwt.sign(
    { username: matchedUser.username },
    process.env.JWT_SECRET,
    { expiresIn: "12h" },
  );

  return sendJson(res, 200, {
    token,
    user: { username: matchedUser.username },
  });
}

async function health(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "GET") return methodNotAllowed(res);
  return sendJson(res, 200, { status: "ok" });
}

async function listWishItems(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  return sendJson(res, 200, await listWishes());
}

async function createWishItem(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const { title } = req.body || {};
  if (!title || !title.trim()) {
    return sendJson(res, 400, { message: "Title is required" });
  }

  return sendJson(res, 201, await createWish(req.body || {}));
}

async function updateWish(req, res, id) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const { isCompleted, completionData } = req.body || {};
  const updated = await updateWishStatus(id, isCompleted, completionData);

  if (!updated) {
    return sendJson(res, 404, { message: "Wish not found" });
  }

  return sendJson(res, 200, updated);
}

async function updateWishDetailsRoute(req, res, id) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();

  try {
    const updated = await updateWishDetails(id, req.body || {});
    if (!updated) {
      return sendJson(res, 404, { message: "Wish not found" });
    }
    return sendJson(res, 200, updated);
  } catch (error) {
    if (error.statusCode === 400) {
      return sendJson(res, 400, { message: error.message });
    }
    throw error;
  }
}

async function getCounter(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const members = await listAllowedUsernames();
  const counterData = await loadCounterData(members);

  return sendJson(res, 200, {
    ...counterData,
    milestones: buildMilestones(counterData.startDate),
    pendingForMe: (counterData.invites || []).filter(
      (invite) => invite.to === user.username && invite.status === "pending",
    ),
  });
}

async function patchCounter(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const members = await listAllowedUsernames();
  const counterData = await loadCounterData(members);
  const nextStartDate = req.body?.startDate;
  const nextCoupleName = req.body?.coupleName;

  if (nextStartDate) {
    const parsed = new Date(nextStartDate);
    if (Number.isNaN(parsed.getTime())) {
      return sendJson(res, 400, { message: "Invalid startDate" });
    }
    counterData.startDate = nextStartDate;
  }

  if (nextCoupleName && String(nextCoupleName).trim()) {
    counterData.coupleName = String(nextCoupleName).trim();
  }

  await saveCounterData(counterData, members);
  return sendJson(res, 200, {
    ...counterData,
    milestones: buildMilestones(counterData.startDate),
  });
}

async function createInvite(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const members = await listAllowedUsernames();
  const counterData = await loadCounterData(members);
  const to = members.find((username) => username !== user.username);
  const proposedAt = req.body?.proposedAt;
  const note = req.body?.note || "";

  if (!to) {
    return sendJson(res, 400, { message: "Recipient not found" });
  }

  const parsed = new Date(proposedAt);
  if (!proposedAt || Number.isNaN(parsed.getTime())) {
    return sendJson(res, 400, { message: "Invalid proposedAt" });
  }

  const invite = {
    id: `inv_${Date.now()}`,
    code: generateInviteCode(),
    from: user.username,
    to,
    proposedAt,
    note,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  counterData.invites = [invite, ...(counterData.invites || [])].slice(0, 30);
  await saveCounterData(counterData, members);
  return sendJson(res, 201, invite);
}

async function handleInvite(req, res, id) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const members = await listAllowedUsernames();
  const counterData = await loadCounterData(members);
  const { action, code } = req.body || {};

  const inviteIndex = (counterData.invites || []).findIndex((invite) => invite.id === id);
  if (inviteIndex < 0) {
    return sendJson(res, 404, { message: "Invite not found" });
  }

  const invite = counterData.invites[inviteIndex];

  if (invite.to !== user.username) {
    return sendJson(res, 403, { message: "You are not allowed to process this invite" });
  }

  if (invite.status !== "pending") {
    return sendJson(res, 400, { message: "Invite has already been processed" });
  }

  if (action === "accept") {
    if (!code || String(code).toUpperCase() !== invite.code) {
      return sendJson(res, 400, { message: "Invite code is incorrect" });
    }
    invite.status = "accepted";
    invite.respondedAt = new Date().toISOString();
    counterData.startDate = invite.proposedAt;
  } else if (action === "reject") {
    invite.status = "rejected";
    invite.respondedAt = new Date().toISOString();
  } else {
    return sendJson(res, 400, { message: "Invalid action" });
  }

  counterData.invites[inviteIndex] = invite;
  await saveCounterData(counterData, members);

  return sendJson(res, 200, {
    invite,
    startDate: counterData.startDate,
    milestones: buildMilestones(counterData.startDate),
  });
}

async function getProfile(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "GET") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const members = await listAllowedUsernames();
  const counterData = await loadCounterData(members);

  const me = counterData.profiles[user.username];
  const partnerUsername = members.find((username) => username !== user.username);
  const partner = partnerUsername ? counterData.profiles[partnerUsername] : null;

  return sendJson(res, 200, { me, partner });
}

async function patchProfile(req, res) {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "PATCH") return methodNotAllowed(res);

  const user = await requireAuth(req, res);
  if (!user) return;

  await connectMongoIfNeeded();
  const members = await listAllowedUsernames();
  const counterData = await loadCounterData(members);
  const currentProfile = counterData.profiles[user.username] || { username: user.username };

  const payload = req.body || {};
  const avatarUrl =
    payload.avatarUrl === undefined
      ? (currentProfile.avatarUrl || "")
      : payload.avatarUrl?.toString() || "";

  if (avatarUrl.length > 1500000) {
    return sendJson(res, 400, { message: "Avatar image is too large" });
  }

  if (avatarUrl && !avatarUrl.startsWith("data:image/") && !avatarUrl.startsWith("http")) {
    return sendJson(res, 400, { message: "Invalid avatar image" });
  }

  const updatedProfile = {
    ...currentProfile,
    displayName: payload.displayName?.toString().trim() || currentProfile.displayName || user.username,
    roleLabel: payload.roleLabel?.toString().trim() || currentProfile.roleLabel || "Member",
    bio: payload.bio?.toString().trim() || "",
    favoriteDateSpot: payload.favoriteDateSpot?.toString().trim() || "",
    avatarUrl,
  };

  counterData.profiles[user.username] = updatedProfile;
  await saveCounterData(counterData, members);

  const partnerUsername = members.find((username) => username !== user.username);
  const partner = partnerUsername ? counterData.profiles[partnerUsername] : null;

  return sendJson(res, 200, { me: updatedProfile, partner });
}

module.exports = {
  login,
  health,
  listWishItems,
  createWishItem,
  updateWish,
  updateWishDetailsRoute,
  getCounter,
  patchCounter,
  createInvite,
  handleInvite,
  getProfile,
  patchProfile,
  requireAuth,
  sendJson,
  handleOptions,
  methodNotAllowed,
  buildMilestones,
};