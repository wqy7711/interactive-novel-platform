const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Favorite", FavoriteSchema);
