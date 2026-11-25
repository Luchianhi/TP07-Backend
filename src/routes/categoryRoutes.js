import express from 'express';
const router = express.Router();
import * as controller from '../controllers/categoryController.js';
import {categoryRules, validate} from '../middlewares/validation.js';

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', categoryRules, validate, controller.create);
router.put('/:id', categoryRules, validate, controller.update);
router.delete('/:id', controller.remove);

export default router;
