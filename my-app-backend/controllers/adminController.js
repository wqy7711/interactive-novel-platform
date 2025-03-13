const User = require("../models/User");
const Story = require("../models/Story");
const Comment = require("../models/Comment");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("uid email username role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: "blocked" }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User blocked", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: "user" }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User unblocked", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingStories = async (req, res) => {
  try {
    const stories = await Story.find({ status: "pending" });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    res.json({ message: "Story approved", story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    res.json({ message: "Story rejected", story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingComments = async (req, res) => {
  try {
    const comments = await Comment.find({ status: "pending" });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    res.json({ message: "Comment approved", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    res.json({ message: "Comment rejected", comment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
