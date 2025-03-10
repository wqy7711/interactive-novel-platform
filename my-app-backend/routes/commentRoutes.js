const express = require("express");
const { addComment, getComments, deleteComment, likeComment } = require("../controllers/commentController");

const router = express.Router();

router.post("/", addComment);
router.get("/:storyId", getComments);
router.delete("/:id", deleteComment);
router.put("/:id/like", likeComment);

module.exports = router;
