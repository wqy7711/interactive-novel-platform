const Comment = require("../models/Comment");

exports.getPendingComments = async (req, res) => {
  try {
    const pendingComments = await Comment.find({ status: "pending" });
    res.json(pendingComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.status = "approved";
    await comment.save();

    res.json({ message: "Comment approved successfully", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    comment.status = "rejected";
    await comment.save();

    res.json({ message: "Comment rejected successfully", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
