const Bookmark = require("../models/Bookmark");

exports.addBookmark = async (req, res) => {
  try {
    const { userId, storyId, chapter, progress } = req.body;

    const newBookmark = new Bookmark({ userId, storyId, chapter, progress });
    await newBookmark.save();

    res.status(201).json({ message: "Bookmark added successfully", bookmark: newBookmark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.params.userId }).populate("storyId", "title coverImage");
    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const deletedBookmark = await Bookmark.findByIdAndDelete(req.params.id);
    if (!deletedBookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
