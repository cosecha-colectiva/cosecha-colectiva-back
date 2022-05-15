const mysql =require('mysql');
const util =require('util');

const pool = mysql.createPool({
    connectionLimit:10,
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'bb10328524c8cc',
    password: '2c0560cd',
    database: 'heroku_73c49846cee5928'
})

pool.query = util.promisify(pool.query);
module.exports = pool;