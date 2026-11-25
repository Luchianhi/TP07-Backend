import express from 'express';
import * as controller from '../controllers/productController.js';
import {productRules, validate} from '../middlewares/validation.js';
import { authorize } from '../middleware/auth.js';

const router = express.Router();

// GET reste accessible à tout USER authentifié
router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/:id', controller.getOne);
router.post('/', authorize('ADMIN'), productRules, validate, controller.create);
router.put('/:id', authorize('ADMIN'), productRules, validate, controller.update);
router.delete('/:id', authorize('ADMIN'), controller.remove);
router.post('/with-category', authorize('ADMIN'), controller.createWithCategory);

export default router;
