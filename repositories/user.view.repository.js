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

const getViewedHistoriesById = async (id) => {
    try {
        const viewedHistories = await client.query(`
            SELECT * FROM user_view_histories
            WHERE user_id = $1 AND deleted_at IS NULL
        `, [id]);

        return viewedHistories.rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const updateViewedHistoriesById = async (id) => {
    try {
        await client.query(`
            UPDATE user_view_histories
            SET viewed_at = now()
            WHERE user_id = $1 AND viewed_at IS NULL
        `, [id]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}




module.exports = {
    getViewedHistoriesById,
    updateViewedHistoriesById
};
