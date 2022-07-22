const mysql = require('mysql2');
const { host, user, password, database } = require('./config');

const db = mysql.createPool({
    connectionLimit: 10,
    host,
    user,
    password,
    database
}).promise(); 

// (error, results, fields) => {}
// [results, fields] = await query(sql, values)
// [nombreResultado] = await db.query(sql, values)

module.exports = db;