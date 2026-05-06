const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    code: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    proposedAt: { type: String, required: true },
    note: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    createdAt: { type: String, required: true },
    respondedAt: { type: String, default: "" },
  },
  { _id: false },
);

const counterStateSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true, index: true },
    startDate: { type: String, default: "2024-02-14T19:00" },
    coupleName: { type: String, default: "Minh & Em" },
    members: { type: [String], default: [] },
    invites: { type: [inviteSchema], default: [] },
    profiles: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

module.exports = mongoose.model("CounterState", counterStateSchema);