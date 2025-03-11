const express = require("express");
const { addFavorite, getFavorites, removeFavorite } = require("../controllers/favoriteController");

const router = express.Router();

router.post("/", addFavorite);
router.get("/:userId", getFavorites);
router.delete("/:id", removeFavorite);

module.exports = router;
