// controllers/claude.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const logger = require("../configs/logger.js");

const { verifyAllprocess } = require("../configs/middleware.js");

// POST /claude
// Request body: { message: string }
router.post("/", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("POST /claude");
    const { message } = req.body;
    const response = await axios.post(
      process.env.CLAUDE_API_URL,
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLAUDE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
