import {Router} from 'express';

const router = Router();

import {populateTables, getAllImages, getLimitedImages, getImagesByCategory, getImagesByBreed, getLimitedImagesByCategory, getLimitedImagesByBreed} from '../controllers/images.controller';

router.get('/populate', populateTables);
router.get('/images/all', getAllImages);
router.get('/images/page/:page', getLimitedImages);
router.get('/images/category/:category', getImagesByCategory);
router.get('/images/category/:category/:page', getLimitedImagesByCategory);
router.get('/images/breed/:breed', getImagesByBreed);
router.get('/images/breed/:breed/:page', getLimitedImagesByBreed);

export default router;