module.exports = {
    port: process.env.PORT || 3000,
    host: process.env.DB_HOST || 'us-cdbr-east-05.cleardb.net',
    user: process.env.DB_USER || 'bb10328524c8cc',
    password: process.env.DB_PASSWORD || '2c0560cd',
    database: process.env.DB_NAME || 'heroku_73c49846cee5928',
    secret: process.env.JWT_SECRET || 'gato'
}