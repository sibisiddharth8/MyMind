import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { uploadTermImage } from '../middleware/multer';
import {
    createTermController,
    getAllTermsController,
    updateTermController,
    updateTermOrderController,
    deleteTermController
} from '../controllers/terms.controller';

const router = Router();

// --- PUBLIC ROUTE ---
router.get('/terms', getAllTermsController);

// --- PROTECTED ADMIN ROUTES ---
router.post('/terms', protect, uploadTermImage, createTermController);
router.patch('/terms/order', protect, updateTermOrderController); // For reordering
router.put('/terms/:id', protect, uploadTermImage, updateTermController);
router.delete('/terms/:id', protect, deleteTermController);

export default router;