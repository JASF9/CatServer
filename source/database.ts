import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export default new Pool({
    user: process.env.USER_DB,
    host: process.env.HOST_DB,
    database: process.env.NAME_DB,
    password: process.env.PASSWORD_DB,
    port: parseInt(process.env.PORT_DB || ''),
    max:100,
    idleTimeoutMillis:30000,
    ssl: {
        rejectUnauthorized: false
      }
    
});


