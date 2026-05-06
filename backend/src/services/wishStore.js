const path = require("path");
const { randomUUID } = require("crypto");
const Wish = require("../models/Wish");
const { readJson, writeJson } = require("../utils/fileDb");
const { connectMongoIfNeeded, isMongoEnabled } = require("../utils/mongo");

const wishesPath = path.join(__dirname, "../../data/wishes.json");

async function syncWishesFromSeed() {
  const existingCount = await Wish.estimatedDocumentCount();
  if (existingCount > 0) return;

  const seedWishes = await readJson(wishesPath, []);
  if (!seedWishes.length) return;

  await Wish.insertMany(
    seedWishes.map((wish) => ({
      _id: wish._id || randomUUID(),
      title: wish.title,
      description: wish.description || "",
      category: wish.category || "Together",
      isCompleted: Boolean(wish.isCompleted),
      image: wish.image || "",
      createdAt: wish.createdAt ? new Date(wish.createdAt) : new Date(),
    })),
  );
}

async function listWishes() {
  if (isMongoEnabled) {
    await syncWishesFromSeed();
    return Wish.find().sort({ createdAt: -1 }).lean();
  }

  const wishes = await readJson(wishesPath, []);
  return wishes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createWish(payload) {
  const wishData = {
    title: payload.title,
    description: payload.description || "",
    category: payload.category || "Together",
    isCompleted: Boolean(payload.isCompleted),
    image: payload.image || "",
    completionData: {
      completedAt: null,
      checkInImages: [],
      notes: "",
    },
  };

  if (isMongoEnabled) {
    const created = await Wish.create(wishData);
    return created.toObject();
  }

  const wishes = await readJson(wishesPath, []);
  const newWish = {
    _id: randomUUID(),
    ...wishData,
    createdAt: new Date().toISOString(),
  };

  wishes.push(newWish);
  await writeJson(wishesPath, wishes);
  return newWish;
}

async function updateWishDetails(id, payload) {
  if (isMongoEnabled) {
    const existing = await Wish.findById(id).lean();
    if (!existing) return null;
    if (existing.isCompleted) {
      const error = new Error("Wish already completed and cannot be edited");
      error.statusCode = 400;
      throw error;
    }

    const nextDetails = {
      title: payload.title?.trim() || existing.title,
      description: payload.description ?? existing.description ?? "",
      category: payload.category?.trim() || existing.category || "Together",
      image: payload.image ?? existing.image ?? "",
    };

    const updated = await Wish.findByIdAndUpdate(id, nextDetails, { new: true });
    return updated ? updated.toObject() : null;
  }

  const wishes = await readJson(wishesPath, []);
  const index = wishes.findIndex((wish) => wish._id === id);

  if (index < 0) return null;
  if (wishes[index].isCompleted) {
    const error = new Error("Wish already completed and cannot be edited");
    error.statusCode = 400;
    throw error;
  }

  const currentWish = wishes[index];
  const nextDetails = {
    title: payload.title?.trim() || currentWish.title,
    description: payload.description ?? currentWish.description ?? "",
    category: payload.category?.trim() || currentWish.category || "Together",
    image: payload.image ?? currentWish.image ?? "",
  };

  wishes[index] = {
    ...currentWish,
    ...nextDetails,
  };

  await writeJson(wishesPath, wishes);
  return wishes[index];
}

async function updateWishStatus(id, isCompleted, completionData = null) {
  const updateData = { isCompleted: Boolean(isCompleted) };

  if (isCompleted && completionData) {
    updateData.completionData = {
      completedAt: new Date(),
      checkInImages: completionData.checkInImages || [],
      notes: completionData.notes || "",
    };
  } else if (!isCompleted) {
    updateData.completionData = {
      completedAt: null,
      checkInImages: [],
      notes: "",
    };
  }

  if (isMongoEnabled) {
    const updated = await Wish.findByIdAndUpdate(id, updateData, { new: true });
    return updated ? updated.toObject() : null;
  }

  const wishes = await readJson(wishesPath, []);
  const index = wishes.findIndex((wish) => wish._id === id);

  if (index < 0) return null;

  wishes[index] = { ...wishes[index], ...updateData };
  await writeJson(wishesPath, wishes);
  return wishes[index];
}

module.exports = {
  connectMongoIfNeeded,
  isMongoEnabled,
  listWishes,
  createWish,
  updateWishDetails,
  updateWishStatus,
};
