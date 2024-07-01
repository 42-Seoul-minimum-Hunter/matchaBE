const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

client.connect();

const saveAlarmById = async (userId, alarmedId, alarmType) => {
    try {
        await client.query(
            `
            INSERT INTO user_alarm_histories
            (user_id, alarmed_id, alarm_type)
            VALUES ($1, $2, $3)
            `,
            [userId, alarmedId, alarmType]
        )
    } catch (error) {
            console.log(error);
    throw error;
    }
}

const findAllAlarmsById = async (id) => {
    try {
        const result = await client.query(
            `
            SELECT * FROM user_alarm_histories
            WHERE user_id = $1 AND deleted_at IS NULL
            `,
            [id]
        );

        return result.rows;
    } catch (error) {
            console.log(error);
    throw error;
    }
}

const deleteAllAlarmsById = async (id) => {
    try {
        await client.query(
            `
            UPDATE user_alarm_histories
            SET deleted_at = NOW()
            WHERE user_id = $1 AND deleted_at IS NULL
            `,
            [id]
        );
    } catch (error) {
            console.log(error);
    throw error;
    }
}


module.exports = {
    saveAlarmById,
    findAllAlarmsById,
    deleteAllAlarmsById
};