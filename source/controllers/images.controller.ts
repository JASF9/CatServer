import { Request, Response } from 'express';
import axios from 'axios';
import pool from '../database'
import dotenv from 'dotenv';
dotenv.config();

export const populateTables = async (req: Request, res: Response) => {
    try{
        const client = await pool.connect();

        const breedsInfo = await axios.get('https://api.thecatapi.com/v1/breeds',{
            headers:{
                "x-api-key": process.env.API_KEY
            }
        });
        for(let i=0; i<breedsInfo.data.length; i++){
            let breed_sql = `INSERT INTO breed (breed_id, name, temperament, life_span, wikipedia_url, origin) VALUES 
                ('${breedsInfo.data[i].id}', '${breedsInfo.data[i].name}', '${breedsInfo.data[i].temperament}', 
                '${breedsInfo.data[i].life_span}', '${breedsInfo.data[i].wikipedia_url}', '${breedsInfo.data[i].origin}')`;
            let breedResult = await client.query(breed_sql);
        }

        const categoriesInfo = await axios.get('https://api.thecatapi.com/v1/categories',{
            headers:{ 
                "x-api-key": process.env.API_KEY
            }
        });
        for(let i=0; i<categoriesInfo.data.length; i++){
            let category_sql = `INSERT INTO category (category_id, name) VALUES ('${categoriesInfo.data[i].id}', '${categoriesInfo.data[i].name}')`;
            let categoryResult = await client.query(category_sql);
        }

        let img_count = 0;
        do {
            const imageInfo = await axios.get('https://api.thecatapi.com/v1/images/search',{
                headers:{
                    "x-api-key": process.env.API_KEY
                }
            });
            
            if(imageInfo.data[0].breeds.length>0 || imageInfo.data[0].hasOwnProperty('categories')){
                if(imageInfo.data[0].breeds.length>0){
                    let image_sql = `INSERT INTO image (image_id, url, height, width) 
                        VALUES ('${imageInfo.data[0].id}', '${imageInfo.data[0].url}', '${imageInfo.data[0].height}', '${imageInfo.data[0].width}')`;

                    client.query(image_sql)
                    .then(async (imageResult) => {
                        for(let i=0; i<imageInfo.data[0].breeds.length; i++){
                            let image_breed_sql = `INSERT INTO image_breed (breed_id, image_id) VALUES ('${imageInfo.data[0].breeds[i].id}', '${imageInfo.data[0].id}')`;
                            let imageBreedResult = await client.query(image_breed_sql);
                        }
                        img_count++;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
                else {
                    let image_sql = `INSERT INTO image (image_id, url, height, width) 
                        VALUES ('${imageInfo.data[0].id}', '${imageInfo.data[0].url}', '${imageInfo.data[0].height}', '${imageInfo.data[0].width}')`;

                    client.query(image_sql)
                    .then(async (imageResult) => {
                        for(let i=0; i<imageInfo.data[0].categories.length; i++){
                            let image_category_sql = `INSERT INTO image_category (category_id, image_id) VALUES ('${imageInfo.data[0].categories[i].id}', '${imageInfo.data[0].id}')`;
                            let imageCategoryResult = await client.query(image_category_sql);
                        }
                        img_count++;
                    })
                    .catch(err => {
                        console.log(err);
                    });
                }
            }
        } while(img_count<100);

        client.release();
        return res.status(200).json({status: 200, message: 'DB populated.'});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error. Could not populate the DB.'});
    }
}

export const getAllImages = async (req: Request, res: Response) => {
    try {
        const client = await pool.connect();
        const image_sql = 'SELECT * FROM image';
        let imagesResult = await client.query(image_sql);

        for (let i=0; i<imagesResult.rowCount; i++){
            let id = imagesResult.rows[i].image_id;

            let category_sql = `SELECT * FROM image_category INNER JOIN category USING(category_id) WHERE image_category.image_id='${id}'`;
            const categoriesResult = await client.query(category_sql);
            
            let breed_sql = `SELECT * FROM image_breed INNER JOIN breed USING(breed_id) WHERE image_breed.image_id='${id}'`;
            const breedsResult = await client.query(breed_sql);

            let image_to_set = {...imagesResult.rows[i], categories: categoriesResult.rows, breeds: breedsResult.rows};
            imagesResult.rows.splice(i, 1, image_to_set);
        }

        client.release();
        return res.status(200).json({status: 200, result: imagesResult.rows, row_count: imagesResult.rowCount});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error.'});
    }
}

export const getLimitedImages = async (req: Request, res: Response) => {
    const {page} = req.params;
    const rowCount = (Number(page)-1)*6;
    try {
        const client = await pool.connect();
        const image_sql = `SELECT * FROM image LIMIT 6 OFFSET ${rowCount}`;
        let imagesResult = await client.query(image_sql);

        for (let i=0; i<imagesResult.rowCount; i++){
            let id = imagesResult.rows[i].image_id;

            let category_sql = `SELECT * FROM image_category INNER JOIN category USING(category_id) WHERE image_category.image_id='${id}'`;
            const categoriesResult = await client.query(category_sql);
            
            let breed_sql = `SELECT * FROM image_breed INNER JOIN breed USING(breed_id) WHERE image_breed.image_id='${id}'`;
            const breedsResult = await client.query(breed_sql);

            let image_to_set = {...imagesResult.rows[i], categories: categoriesResult.rows, breeds: breedsResult.rows};
            imagesResult.rows.splice(i, 1, image_to_set);
        }

        client.release();
        return res.status(200).json({status: 200, result: imagesResult.rows, row_count: imagesResult.rowCount});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error.'});
    }
}

export const getImagesByCategory = async (req: Request, res: Response) => {
    const {category} = req.params;
    try {
        const client = await pool.connect();
        const image_sql = `SELECT * FROM image`;
        let imagesResult = await client.query(image_sql);

        for (let i=0; i<imagesResult.rowCount; i++){
            let id = imagesResult.rows[i].image_id;

            if(category!=='' && category!=='any'){
                let category_sql = `SELECT * FROM image_category INNER JOIN category USING(category_id) WHERE image_category.image_id='${id}' AND category.name='${category}'`;
                const categoryResult = await client.query(category_sql);

                if(categoryResult.rowCount>0){
                    let categories_sql = `SELECT * FROM image_category INNER JOIN category USING(category_id) WHERE image_category.image_id='${id}'`;
                    const categoriesResult = await client.query(categories_sql);

                    let image_to_set = {...imagesResult.rows[i], categories: categoriesResult.rows};
                    imagesResult.rows.splice(i, 1, image_to_set);
                }
            }
        }

        client.release();
        let filteredResponse = imagesResult.rows.filter(img => img.hasOwnProperty('categories') || img.hasOwnProperty('breeds'));
        return res.status(200).json({status: 200, result: filteredResponse, row_count: filteredResponse.length});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error.'});
    }
}

export const getImagesByBreed = async (req: Request, res: Response) => {
    const {breed} = req.params;
    try {
        const client = await pool.connect();
        const image_sql = `SELECT * FROM image`;
        let imagesResult = await client.query(image_sql);

        for (let i=0; i<imagesResult.rowCount; i++){
            let id = imagesResult.rows[i].image_id;

            if(breed!=='' && breed!=='any'){
                let breed_sql = `SELECT * FROM image_breed INNER JOIN breed USING(breed_id) WHERE image_breed.image_id='${id}' AND breed.breed_id='${breed}'`;
                const breedResult = await client.query(breed_sql);
                
                if(breedResult.rowCount>0){
                    let breeds_sql = `SELECT * FROM image_breed INNER JOIN breed USING(breed_id) WHERE image_breed.image_id='${id}'`;
                    const breedsResult = await client.query(breeds_sql);

                    let image_to_set = {...imagesResult.rows[i], breeds: breedsResult.rows};
                    imagesResult.rows.splice(i, 1, image_to_set);
                }
            }
        }

        client.release();
        let filteredResponse = imagesResult.rows.filter(img => img.hasOwnProperty('categories') || img.hasOwnProperty('breeds'));
        return res.status(200).json({status: 200, result: filteredResponse, row_count: filteredResponse.length});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error.'});
    }
}

export const getLimitedImagesByCategory = async (req: Request, res: Response) => {
    const {page, category} = req.params;
    const rowCount = (Number(page)-1)*6;
    try {
        const client = await pool.connect();
        const image_sql = `SELECT * FROM image`;
        let imagesResult = await client.query(image_sql);

        for (let i=0; i<imagesResult.rowCount; i++){
            let id = imagesResult.rows[i].image_id;

            if(category!=='' && category!=='any'){
                let category_sql = `SELECT * FROM image_category INNER JOIN category USING(category_id) WHERE image_category.image_id='${id}' AND category.name='${category}'`;
                const categoryResult = await client.query(category_sql);

                if(categoryResult.rowCount>0){
                    let categories_sql = `SELECT * FROM image_category INNER JOIN category USING(category_id) WHERE image_category.image_id='${id}'`;
                    const categoriesResult = await client.query(categories_sql);

                    let image_to_set = {...imagesResult.rows[i], categories: categoriesResult.rows};
                    imagesResult.rows.splice(i, 1, image_to_set);
                }
            }
        }

        client.release();
        let filteredResponse = imagesResult.rows.filter(img => img.hasOwnProperty('categories') || img.hasOwnProperty('breeds'));
        let limitedAndFiltered = filteredResponse.slice(Number(rowCount), Number(rowCount)+6)
        return res.status(200).json({status: 200, result: limitedAndFiltered, row_count: filteredResponse.length});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error.'});
    }
}

export const getLimitedImagesByBreed = async (req: Request, res: Response) => {
    const {page, breed} = req.params;
    const rowCount = (Number(page)-1)*6;
    try {
        const client = await pool.connect();
        const image_sql = `SELECT * FROM image`;
        let imagesResult = await client.query(image_sql);

        for (let i=0; i<imagesResult.rowCount; i++){
            let id = imagesResult.rows[i].image_id;

            if(breed!=='' && breed!=='any'){
                let breed_sql = `SELECT * FROM image_breed INNER JOIN breed USING(breed_id) WHERE image_breed.image_id='${id}' AND breed.breed_id='${breed}'`;
                const breedResult = await client.query(breed_sql);
                
                if(breedResult.rowCount>0){
                    let breeds_sql = `SELECT * FROM image_breed INNER JOIN breed USING(breed_id) WHERE image_breed.image_id='${id}'`;
                    const breedsResult = await client.query(breeds_sql);

                    let image_to_set = {...imagesResult.rows[i], breeds: breedsResult.rows};
                    imagesResult.rows.splice(i, 1, image_to_set);
                }
            }
        }

        client.release();
        let filteredResponse = imagesResult.rows.filter(img => img.hasOwnProperty('categories') || img.hasOwnProperty('breeds'));
        let limitedAndFiltered = filteredResponse.slice(Number(rowCount), Number(rowCount)+6)
        return res.status(200).json({status: 200, result: limitedAndFiltered, row_count: filteredResponse.length});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({status: 500, message: 'Server Error.'});
    }
}