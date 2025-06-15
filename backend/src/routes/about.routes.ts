import { Router } from 'express';
// CHANGE IS HERE: Use the new name 'uploadAboutFiles'
import { uploadAboutFiles } from '../middleware/multer';
import { 
  getAboutController, 
  upsertAboutController, 
  deleteAboutController 
} from '../controllers/about.controller';

const router = Router();

// GET /api/about - Fetches the about section data
router.get('/about', getAboutController);

// PUT /api/about - Creates or updates the about section. 
// CHANGE IS HERE: Use the new name 'uploadAboutFiles' for the middleware
router.put('/about', uploadAboutFiles, upsertAboutController);

// DELETE /api/about - Deletes the about section data
router.delete('/about', deleteAboutController);

export default router;