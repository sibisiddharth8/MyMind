import { Router } from 'express';
import { uploadSkillImage } from '../middleware/multer';
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
  createSkillController,
  updateSkillController,
  deleteSkillController,
  getCategorySummariesController
} from '../controllers/skills.controller';

import { protect } from '../middleware/auth.middleware';

const router = Router();

// --- Skill Category Routes ---
router.post('/skill-categories', protect, createCategoryController);
router.get('/skill-categories', getAllCategoriesController);
router.get('/skill-categories/summary', getCategorySummariesController);
router.get('/skill-categories/:id', getCategoryByIdController);
router.put('/skill-categories/:id', protect, updateCategoryController);
router.delete('/skill-categories/:id', protect, deleteCategoryController);

// --- Skill Routes ---
router.post('/skills', protect, uploadSkillImage, createSkillController);
router.put('/skills/:id', protect, uploadSkillImage, updateSkillController);
router.delete('/skills/:id', protect, deleteSkillController);

export default router;