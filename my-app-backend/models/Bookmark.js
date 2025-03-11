const mongoose = require("mongoose");

const BookmarkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
  chapter: { type: String, required: true },
  progress: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Bookmark", BookmarkSchema);
