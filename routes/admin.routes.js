import express from 'express';
import { analyzeProducts, dashboardStats, insertProducts } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/dashboard', dashboardStats);
router.get('/analyze-products', analyzeProducts);
// router.get('/seed-products', insertProducts);

export default router;
