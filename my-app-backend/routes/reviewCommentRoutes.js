const express = require("express");
const { getPendingComments, approveComment, rejectComment } = require("../controllers/reviewCommentController");

const router = express.Router();

router.get("/", getPendingComments);
router.put("/:id/approve", approveComment);
router.put("/:id/reject", rejectComment);

module.exports = router;
