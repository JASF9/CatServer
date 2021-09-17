import express, {Express} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app : Express = express();

import images from './routes/images';
import user from './routes/user';

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use(images);
app.use(user);

const PORT = process.env.PORT || 3000
app.listen (PORT, () => {
    console.log('Server running on port', PORT)
});