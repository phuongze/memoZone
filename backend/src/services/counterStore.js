const path = require("path");
const CounterState = require("../models/CounterState");
const { readJson, writeJson } = require("../utils/fileDb");
const { isMongoEnabled } = require("../utils/mongo");

const counterSeedPath = path.join(__dirname, "../../data/counter.json");
const counterStateKey = "default";

function getDefaultCounterData(members) {
  const profiles = members.reduce((acc, username, index) => {
    acc[username] = {
      username,
      displayName: username,
      roleLabel: index === 0 ? "Ban nam" : "Ban nu",
      bio: "",
      favoriteDateSpot: "",
      avatarUrl: "",
    };
    return acc;
  }, {});

  return {
    startDate: "2024-02-14T19:00",
    coupleName: "Minh & Em",
    members,
    invites: [],
    profiles,
  };
}

function ensureCounterDataShape(counterData, members) {
  const base = getDefaultCounterData(members);
  const merged = {
    ...base,
    ...counterData,
    members,
  };

  merged.profiles = members.reduce((acc, username, index) => {
    const defaultProfile = base.profiles[username] || {
      username,
      displayName: username,
      roleLabel: index === 0 ? "Ban nam" : "Ban nu",
      bio: "",
      favoriteDateSpot: "",
      avatarUrl: "",
    };

    acc[username] = {
      ...defaultProfile,
      ...((counterData.profiles || {})[username] || {}),
    };

    return acc;
  }, {});

  // Derive coupleName from member display names when possible
  if (Array.isArray(members) && members.length >= 2) {
    const first = members[0];
    const second = members[1];
    const firstDisplay = merged.profiles?.[first]?.displayName || first;
    const secondDisplay = merged.profiles?.[second]?.displayName || second;
    merged.coupleName = `${firstDisplay} & ${secondDisplay}`;
  }

  return merged;
}

async function loadCounterData(members) {
  if (isMongoEnabled) {
    const existing = await CounterState.findOne({ key: counterStateKey }).lean();

    if (!existing) {
      const seedData = ensureCounterDataShape(
        await readJson(counterSeedPath, getDefaultCounterData(members)),
        members,
      );
      const created = await CounterState.create({
        key: counterStateKey,
        ...seedData,
      });

      return ensureCounterDataShape(created.toObject(), members);
    }

    return ensureCounterDataShape(existing, members);
  }

  const rawCounterData = await readJson(counterSeedPath, getDefaultCounterData(members));
  return ensureCounterDataShape(rawCounterData, members);
}

async function saveCounterData(counterData, members) {
  const normalized = ensureCounterDataShape(counterData, members);

  if (isMongoEnabled) {
    const saved = await CounterState.findOneAndUpdate(
      { key: counterStateKey },
      {
        $set: normalized,
        $setOnInsert: { key: counterStateKey },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).lean();

    return ensureCounterDataShape(saved || normalized, members);
  }

  await writeJson(counterSeedPath, normalized);
  return normalized;
}

module.exports = {
  getDefaultCounterData,
  ensureCounterDataShape,
  loadCounterData,
  saveCounterData,
};