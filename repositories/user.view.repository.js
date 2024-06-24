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

const getViewedHistoriesById = async (id, viewedId) => {
    try {

        const viewedHistories = await client.query(`
            SELECT * FROM user_view_histories
            WHERE user_id = $1 AND viewed_id = $2 AND deleted_at IS NULL
        `, [id, viewedId]);

        return viewedHistories.rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateViewedHistoriesById = async (id, viewedId) => {
    try {
        await client.query(`
            UPDATE user_view_histories
            SET deleted_at = NOW()
            WHERE user_id = $1 AND viewed_id = $2
        `, [id, viewedId]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const saveVisitHistoryById = async (id, viewedId) => {
    try {
        await client.query(`
            INSERT INTO user_view_histories (user_id, viewed_id, created_at)
            VALUES ($1, $2, now())
        `, [id, viewedId]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}




module.exports = {
    getViewedHistoriesById,
    updateViewedHistoriesById,
    saveVisitHistoryById
};
