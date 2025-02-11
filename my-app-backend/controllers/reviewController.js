const Story = require("../models/Story");

exports.getPendingStories = async (req, res) => {
  try {
    const pendingStories = await Story.find({ status: "pending" });
    res.json(pendingStories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    story.status = "approved";
    await story.save();
    
    res.json({ message: "Story approved successfully", story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    story.status = "rejected";
    await story.save();
    
    res.json({ message: "Story rejected successfully", story });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
