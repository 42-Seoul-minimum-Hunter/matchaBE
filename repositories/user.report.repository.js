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

const reportUser = async (report, userId) => {
    try {
        const {
            reportedUsername,
            reason,
        } = report;

        // 평가 대상 사용자 정보 확인
        const reportedInfo = await client.query(`
            SELECT id
            FROM users
            WHERE username = $1 AND deleted_at IS NULL
        `, [reportedUsername]);

        if (reportedInfo.rows.length === 0) {
            throw new Error('평가 대상 사용자가 존재하지 않습니다.');
        }

        await client.query(`
            INSERT INTO user_reports (
                user_id,
                reported_id,
                reason,
                reported_at
            ) VALUES ($1, $2, $3, now())
             RETURNING *
        `, [userId, reportedInfo.rows[0].id, reason]);
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    reportUser
}
