const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Comment", CommentSchema);
