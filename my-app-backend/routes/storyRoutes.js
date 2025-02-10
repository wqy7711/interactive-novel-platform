const express = require("express");
const {
  createStory, getStories, getStoryById, updateStory,
  deleteStory, addBranch, getBranches, deleteBranch
} = require("../controllers/storyController");

const router = express.Router();

router.post("/", createStory);
router.get("/", getStories);
router.get("/:id", getStoryById);
router.put("/:id", updateStory);
router.delete("/:id", deleteStory);
router.post("/:id/branches", addBranch);
router.get("/:id/branches", getBranches);
router.delete("/:id/branches/:branchId", deleteBranch);

module.exports = router;
