import { Router } from 'express';
import { uploadExperienceLogo } from '../middleware/multer';
import {
    createExperienceController,
    getAllExperiencesController,
    getExperienceByIdController,
    updateExperienceController,
    deleteExperienceController
} from '../controllers/experience.controller';

import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/experience', protect, uploadExperienceLogo, createExperienceController);
router.get('/experience', getAllExperiencesController);
router.get('/experience/:id', getExperienceByIdController);
router.put('/experience/:id', protect, uploadExperienceLogo, updateExperienceController);
router.delete('/experience/:id', protect, deleteExperienceController);

export default router;