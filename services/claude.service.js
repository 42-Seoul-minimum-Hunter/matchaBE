const logger = require("../configs/logger");
const axios = require("axios");

const getResponseClaude = async (message) => {
  try {
    logger.info("claude.service.js getResponseClaude: " + message);

    return await axios.post(
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
  } catch (error) {
    logger.error("claude.service.js getResponseClaude: " + error.message);
    throw error;
  }
};

module.exports = {
  getResponseClaude,
};
