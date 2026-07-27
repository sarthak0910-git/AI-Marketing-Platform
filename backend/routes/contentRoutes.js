const express = require("express");
const router = express.Router();

const { generateContent } = require("../controllers/contentController");

router.post("/generate-content", generateContent);

module.exports = router;