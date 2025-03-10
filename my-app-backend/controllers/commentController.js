const Comment = require("../models/Comment");

exports.addComment = async (req, res) => {
  try {
    const { storyId, userId, username, text } = req.body;

    const newComment = new Comment({
      storyId,
      userId,
      username,
      text,
      status: "pending",
    });

    await newComment.save();
    res.status(201).json({ message: "Comment submitted for review", comment: newComment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ storyId: req.params.storyId, status: "approved" });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.likes += 1;
    await comment.save();

    res.json({ message: "Comment liked", likes: comment.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
