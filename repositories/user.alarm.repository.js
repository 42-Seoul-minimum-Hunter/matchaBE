const { Client } = require('pg');

require('dotenv').config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});


client.connect();

const getAlarmsById = async (id) => {
    try {

        const viewInfo = await client.query(`
            SELECT *
            FROM user_view_histories
            WHERE viewed_id = $1 AND viewed_at NOT NULL
            `, [id]);

        // 평가 대상 사용자 정보 확인
        const likeInfo = await client.query(`
            SELECT *
            FROM user_like_histories
            WHERE liked_id = $1 AND viewed_at NOT NULL
        `, [id]);

        const chatInfo = await client.query(`
            SELECT *
            FROM user_chat_histories
            WHERE chat_id = $1 AND viewed_at NOT NULL
            `, [id]);

        const alarmInfo = [...viewInfo.rows, ...likeInfo.rows, ...chatInfo.rows].sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
        });

        await client.query(`
            UPDATE user_like_histories
            SET viewed_at = now()
            WHERE liked_id = $1 AND viewed_at NOT NULL
            `, [id]);

        await client.query(`
            UPDATE user_view_histories
            SET viewed_at = now()
            WHERE viewed_id = $1 AND viewed_at NOT NULL
            `, [id]);

        await client.query(`
            UPDATE user_view_histories
            SET viewed_at = now()
            WHERE viewed_id = $1 AND viewed_at NOT NULL
            `, [id]);


        return alarmInfo;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

module.exports = {
    getAlarmsById
}
