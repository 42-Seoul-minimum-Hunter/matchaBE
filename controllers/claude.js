// controllers/claude.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const logger = require("../configs/logger.js");

// console.log("CLAUDE_API_KEY", CLAUDE_API_KEY);

// POST /claude
// Request body: { message: string }
router.post("/", async function (req, res, next) {
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

    return res.send(response.data.choices[0].message.content);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
