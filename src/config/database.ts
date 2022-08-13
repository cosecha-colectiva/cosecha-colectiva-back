import { createPool } from 'mysql2';
import { host, user, password, database } from './config';

const db = createPool({
    connectionLimit: 20,
    host,
    user,
    password,
    database
}).promise();

export default db;