import { Router } from 'express';
import { 
  getLinksController, 
  upsertLinksController, 
  deleteLinksController 
} from '../controllers/links.controller';

import { protect } from '../middleware/auth.middleware';

const router = Router();

// GET /api/links - Fetches all links
router.get('/links', getLinksController);

// PUT /api/links - Creates or updates the links
router.put('/links', protect, upsertLinksController);

// DELETE /api/links - Deletes the entire links document
router.delete('/links', protect, deleteLinksController);

export default router;