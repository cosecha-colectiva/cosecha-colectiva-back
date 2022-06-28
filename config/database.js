const mysql =require('mysql');
const util =require('util');
const {host, user, password, database} = require('../config/config');

const db = mysql.createPool({
    connectionLimit:10,
    host,
    user,
    password,
    database
})

db.query = util.promisify(db.query);
module.exports = db;