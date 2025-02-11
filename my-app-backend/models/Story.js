const mongoose = require("mongoose");

const BranchSchema = new mongoose.Schema({
  text: { type: String, required: true },
  choices: [{ text: String, nextBranchId: { type: String, required: true } }]
});

const StorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  coverImage: { type: String },
  authorId: { type: String, required: true },
  status: { type: String, enum: ["draft", "pending", "approved", "rejected"], default: "draft" },
  branches: [BranchSchema],
}, { timestamps: true });

module.exports = mongoose.model("Story", StorySchema);
