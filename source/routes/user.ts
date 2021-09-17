import {Router} from 'express';

const router = Router();

import {authUser} from '../controllers/user.controller';

router.get('/oauth/redirect', authUser);

export default router;