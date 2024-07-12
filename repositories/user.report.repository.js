const { Client } = require('pg');
const fs = require('fs');
const logger = require('../configs/logger.js');

require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


client.connect();

const reportUser = async (reportedUserId, reason, userId) => {
    try {
        logger.info("user.report.repository.js reportUser: " + reportedUserId + ", " + reason + ", " + userId);
        await client.query(`
            INSERT INTO user_reports (
                user_id,
                reported_id,
                reason,
                created_at
            ) VALUES ($1, $2, $3, now())
             RETURNING *
        `, [userId, reportedUserId, reason]);
    } catch (error) {
        logger.error("user.report.repository.js reportUser: " + error.message);
        throw error;
    }
};

module.exports = {
    reportUser
}
