const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
        await client.query(`
            INSERT INTO user_reports (
                user_id,
                reported_id,
                reason,
                reported_at
            ) VALUES ($1, $2, $3, now())
             RETURNING *
        `, [userId, reportedUserId, reason]);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    reportUser
}
