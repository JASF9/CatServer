import { Request, Response } from 'express';
import axios from 'axios';
import pool from '../database'
import dotenv from 'dotenv';
dotenv.config();

export const authUser = async (req : Request, res: Response) => {
    try{
        const requestToken = req.query.code;
        const accessResponse = await axios({ 
            url:`https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${requestToken}`,
            headers: {
                accept: "application/json",
            },
        })
        const accessToken = accessResponse.data.access_token;

        const userInfo = await axios({
            url:"https://api.github.com/user", 
            headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: "token " + accessToken,
            }
        })

        const client = await pool.connect();

        let user_check_sql = `SELECT * FROM users WHERE user_id='${userInfo.data.id}'`;
        const userCheck = await client.query(user_check_sql);

        if(userCheck.rowCount>0){
            let user_sql = `UPDATE users SET name='${userInfo.data.name}', email='${userInfo.data.email}', 
            user_url='${userInfo.data.url}', avatar_url='${userInfo.data.avatar_url}' WHERE user_id='${userInfo.data.id}'`;
    
            client.query(user_sql)
            .then(userResult => {
                client.release();
                res.redirect(`${process.env.REDIRECTION_URL}`);
            })
            .catch(err => {
                client.release();
                console.log(err);
                return res.status(500).json({status: 500, message: 'Server Error. Could not save new user.'});
            });
        }
        else{
            let user_sql = `INSERT INTO users (user_id, name, email, user_url, avatar_url) 
            VALUES ('${userInfo.data.id}', '${userInfo.data.name}', '${userInfo.data.email}', '${userInfo.data.url}', '${userInfo.data.avatar_url}')`;
    
            client.query(user_sql)
            .then(userResult => {
                client.release();
                res.redirect(`${process.env.REDIRECTION_URL}`);
            })
            .catch(err => {
                client.release();
                console.log(err);
                return res.status(500).json({status: 500, message: 'Server Error. Could not save new user.'});
            });
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error. Could not complete redirection.'});
    }

}