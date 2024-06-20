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

const findRegionById = async (id) => {
    try {
        const regionInfo = await client.query('SELECT si, gu FROM user_regions WHERE user_id = $1', [userInfo.rows[0].id]);
        return regionInfo.rows;
    } catch (error) {
        return { error: error.message };
    }
}

const updateRegionById = async (si, gu, userId) => {
    try {
        await client.query('UPDATE user_regions SET si = $1, gu = $2 WHERE user_id = $3', [si, gu, userId]);
    } catch (error) {
        return { error: error.message };
    }
}

const saveRegionById = async (si, gu, id) => {
    try {
        await client.query(
            `INSERT INTO user_regions (
                user_id,
                si,
                gu,
                updated_at
            ) VALUES ($1, $2, $3, now())
            `,
            [
                id,
                si,
                gu,
            ]
        )
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    findRegionById,
    updateRegionById,
    saveRegionById
};
