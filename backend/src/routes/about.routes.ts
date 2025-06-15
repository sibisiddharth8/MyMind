import { Router } from 'express';
import { getAboutController, upsertAboutController, deleteAboutController } from '../controllers/about.controller';
import { uploadFiles } from '../middleware/multer';

const router = Router();

// GET /api/about - Fetches the about section data
router.get('/about', getAboutController);

// PUT /api/about - Creates or updates the about section. Uses multer middleware for file uploads.
router.put('/about', uploadFiles, upsertAboutController);

// DELETE /api/about - Deletes the about section data
router.delete('/about', deleteAboutController);

export default router;