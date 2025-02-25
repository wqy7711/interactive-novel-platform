const Story = require("../models/Story");

exports.createStory = async (req, res) => {
  try {
    const { title, description, coverImage, authorId } = req.body;
    const newStory = new Story({ title, description, coverImage, authorId, branches: [] });
    await newStory.save();
    res.status(201).json({ message: "Story created successfully", story: newStory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find().select("title description coverImage status");
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    res.json(story);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedStory) {
      return res.status(404).json({ error: "Story not found" });
    }
    res.json({ message: "Story updated successfully", story: updatedStory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const deletedStory = await Story.findByIdAndDelete(req.params.id);
    if (!deletedStory) {
      return res.status(404).json({ error: "Story not found" });
    }
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addBranch = async (req, res) => {
  try {
    const { text, choices } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    const newBranch = { text, choices };
    story.branches.push(newBranch);
    await story.save();

    res.json({ message: "Branch added successfully", branch: newBranch });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBranches = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    res.json(story.branches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    story.branches = story.branches.filter(branch => branch._id.toString() !== req.params.branchId);
    await story.save();

    res.json({ message: "Branch deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
