const express = require("express");
const { getPendingStories, approveStory, rejectStory } = require("../controllers/reviewController");

const router = express.Router();

router.get("/stories", getPendingStories);
router.put("/stories/:id/approve", approveStory);
router.put("/stories/:id/reject", rejectStory);

module.exports = router;
