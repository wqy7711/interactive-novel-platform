const Favorite = require("../models/Favorite");

exports.addFavorite = async (req, res) => {
  try {
    const { userId, storyId } = req.body;

    const existingFavorite = await Favorite.findOne({ userId, storyId });
    if (existingFavorite) {
      return res.status(400).json({ error: "Story already favorited" });
    }

    const newFavorite = new Favorite({ userId, storyId });
    await newFavorite.save();

    res.status(201).json({ message: "Story added to favorites", favorite: newFavorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.params.userId }).populate("storyId", "title coverImage");
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const deletedFavorite = await Favorite.findByIdAndDelete(req.params.id);
    if (!deletedFavorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json({ message: "Favorite removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
