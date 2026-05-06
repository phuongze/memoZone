const mongoose = require("mongoose");

const wishSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Together" },
    isCompleted: { type: Boolean, default: false },
    image: { type: String, default: "" },
    completionData: {
      completedAt: { type: Date, default: null },
      checkInImages: { type: [String], default: [] },
      notes: { type: String, default: "" },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
);

module.exports = mongoose.model("Wish", wishSchema);
