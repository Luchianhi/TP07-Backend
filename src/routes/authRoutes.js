import { Router } from 'express';
import { register, login, getMe, refresh, deleteMe } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { registerValidation, handleValidation } from '../middleware/validators.js';

const router = Router();

router.post('/register', registerValidation, handleValidation, register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/refresh', authenticate, refresh);   // Exercice niveau 1
router.delete('/me', authenticate, deleteMe);     // Exercice niveau 2

export default router;
