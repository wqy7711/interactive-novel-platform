const express = require("express");
const {
  getUsers, blockUser, unblockUser, deleteUser,
  getPendingStories, approveStory, rejectStory, deleteStory,
  getPendingComments, approveComment, rejectComment, deleteComment
} = require("../controllers/adminController");

const router = express.Router();

router.get("/users", getUsers);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.delete("/users/:id", deleteUser);

router.get("/stories/pending", getPendingStories);
router.put("/stories/:id/approve", approveStory);
router.put("/stories/:id/reject", rejectStory);
router.delete("/stories/:id", deleteStory);

router.get("/comments/pending", getPendingComments);
router.put("/comments/:id/approve", approveComment);
router.put("/comments/:id/reject", rejectComment);
router.delete("/comments/:id", deleteComment);

module.exports = router;
