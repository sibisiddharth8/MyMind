import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { uploadEducationLogo } from '../middleware/multer';
import {
    createEducationController,
    getAllEducationsController,
    getEducationByIdController,
    updateEducationController,
    deleteEducationController
} from '../controllers/education.controller';

const router = Router();

router.get('/education', getAllEducationsController);
router.get('/education/:id', getEducationByIdController);
router.post('/education', protect, uploadEducationLogo, createEducationController);
router.put('/education/:id', protect, uploadEducationLogo, updateEducationController);
router.delete('/education/:id', protect, deleteEducationController);

export default router;