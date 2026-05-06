const AuthUser = require("../models/AuthUser");
const { isMongoEnabled } = require("../utils/mongo");

const seededUsers = [
  {
    username: "Dungntt",
    passwordHash: "$2b$10$J9mGspP2LtmhWu9Wm0ARtO2QLI/sWck04VzwZKY.Po9h6jntKr/ZO",
  },
  {
    username: "Phuongnc",
    passwordHash: "$2b$10$uVXX3E4jX/Gixp.8ttxYh.b3rIA1xyKqwmaUWGOswHKYikSnCNWAC",
  },
];

async function syncAuthUsersFromSeed() {
  const existingCount = await AuthUser.estimatedDocumentCount();
  if (existingCount > 0) return;

  await AuthUser.insertMany(seededUsers);
}

async function ensureAuthUsersReady() {
  if (!isMongoEnabled) {
    return seededUsers;
  }

  await syncAuthUsersFromSeed();
  return AuthUser.find().sort({ username: 1 }).lean();
}

async function listAllowedUsernames() {
  const users = await ensureAuthUsersReady();
  return users.map((user) => user.username);
}

async function findUserByUsername(username) {
  await ensureAuthUsersReady();

  if (!isMongoEnabled) {
    return seededUsers.find((user) => user.username === username) || null;
  }

  return AuthUser.findOne({ username }).lean();
}

module.exports = {
  seededUsers,
  ensureAuthUsersReady,
  listAllowedUsernames,
  findUserByUsername,
};