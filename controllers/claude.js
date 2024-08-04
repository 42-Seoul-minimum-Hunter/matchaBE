// controllers/claude.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const logger = require("../configs/logger.js");

const CLAUDE_API_URL = "https://api.openai.com/v1/chat/completions";
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
// console.log("CLAUDE_API_KEY", CLAUDE_API_KEY);

// POST /claude
// Request body: { message: string }
router.post("/", async function (req, res, next) {
  try {
    const { message } = req.body;
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        // model: "gpt-3.5-turbo",
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${CLAUDE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  logger.error(
    "Claude API Error:",
    error.response ? error.response.data : error.message
  );
  res.status(500).json({
    error: "An error occurred while processing your request",
    details: error.response ? error.response.data : error.message,
  });
});

module.exports = router;
