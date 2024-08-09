const express = require("express");
const router = express.Router();

const logger = require("../configs/logger.js");

const claudeService = require("../services/claude.service.js");

const { verifyAllprocess } = require("../configs/middleware.js");

// POST /claude
// Request body: { message: string }
router.post("/", verifyAllprocess, async function (req, res, next) {
  try {
    logger.info("claude.js POST /claude: " + req.body.message);
    const message = req.body.message;

    if (!message) {
      const error = new Error("Invalid request");
      error.status = 400;
      throw error;
    }

    const response = await claudeService.getResponseClaude(message);

    return res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
