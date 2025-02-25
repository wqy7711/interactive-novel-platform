const admin = require("../config/firebase");
const User = require("../models/User");

exports.registerUser = async (req, res) => {
  const { uid, email, username, role } = req.body;

  try {
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists in database" });
    }

    const newUser = new User({
      uid,
      email,
      username,
      role: role || "user",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { uid } = req.body;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.id });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate({ uid: req.params.id }, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ uid: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};