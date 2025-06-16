import { Router } from 'express';
import { uploadExperienceLogo } from '../middleware/multer';
import {
    createExperienceController,
    getAllExperiencesController,
    getExperienceByIdController,
    updateExperienceController,
    deleteExperienceController
} from '../controllers/experience.controller';

const router = Router();

router.post('/experience', uploadExperienceLogo, createExperienceController);
router.get('/experience', getAllExperiencesController);
router.get('/experience/:id', getExperienceByIdController);
router.put('/experience/:id', uploadExperienceLogo, updateExperienceController);
router.delete('/experience/:id', deleteExperienceController);

export default router;