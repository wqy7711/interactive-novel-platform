const express = require("express");
const { addBookmark, getBookmarks, removeBookmark } = require("../controllers/bookmarkController");

const router = express.Router();

router.post("/", addBookmark);
router.get("/:userId", getBookmarks);
router.delete("/:id", removeBookmark);

module.exports = router;
