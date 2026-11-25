import 'dotenv/config';
import express from 'express';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import { authenticate } from './src/middleware/auth.js';
import errorHandler from './src/middlewares/errorHandler.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
// GET /api/products -> Tous les utilisateurs authentifiés
app.use('/api/products', authenticate, productRoutes);
app.use('/api/categories', categoryRoutes);

// En dernier middleware
app.use(errorHandler);

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
