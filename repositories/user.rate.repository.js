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

const rateUser = async (rate, userId) => {
    try {
        var {
            ratedUsername,
            rateScore,
        } = rate;

        rateScore = parseFloat(rateScore);

        //console.log(rate)
        //console.log(userId)

        // 평가 대상 사용자 정보 확인
        const ratedInfo = await client.query(`
            SELECT id
            FROM users
            WHERE username = $1 AND deleted_at IS NULL
        `, [ratedUsername]);

        if (ratedInfo.rows.length === 0) {
            throw new Error('평가 대상 사용자가 존재하지 않습니다.');
        }

        const ratedId = ratedInfo.rows[0].id;

        // 기존 데이터 확인
        const existingRatingResult = await client.query(`
            SELECT * 
            FROM user_ratings
            WHERE user_id = $1 AND rated_id = $2
        `, [userId, ratedId]);

        if (existingRatingResult.rows.length === 0) {

            //console.log(userId + " " + ratedId + " " + rateScore)
            // 새로운 데이터 생성
            await client.query(`
                INSERT INTO user_ratings (
                    user_id,
                    rated_id,
                    rateScore,
                    rated_at
                ) VALUES ($1, $2, $3, now())
                 RETURNING *
            `, [userId, ratedId, rateScore]);
        } else {
            // 기존 데이터 업데이트
            await client.query(`
                UPDATE user_ratings
                SET rateScore = $1, rated_at = now()
                WHERE user_id = $2 AND rated_id = $3
            `, [rateScore, userId, ratedId]);
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    rateUser
}
