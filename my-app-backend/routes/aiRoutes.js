const express = require("express");
const { generateImage } = require("../controllers/aiController");

const router = express.Router();

router.post("/generate-image", generateImage);

module.exports = router;
