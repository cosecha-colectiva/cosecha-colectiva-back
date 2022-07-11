const mysql = require('mysql2');
const { host, user, password, database } = require('../config/config');

const pool = mysql.createPool({
    connectionLimit: 10,
    host,
    user,
    password,
    database
}).promise();

const db = {query: async (sql, values) => {
    return (await pool.query(sql, values))[0]
}}

module.exports = db;