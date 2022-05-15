const jwt = require('jsonwebtoken');
const db = require('../../config/database');

export const getPrueba = async (req, res) => {
    let query = "SELECT * FROM socios";
    const rows = await db.query(query);
    console.log(rows);
    res.send('Hello World')
}

export const register = (req, res) => {
    
}

export const login = (req, res) => {
    res.send('Hello World')
}