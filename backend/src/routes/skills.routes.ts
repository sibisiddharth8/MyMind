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

const router = Router();

// --- Skill Category Routes ---
router.post('/skill-categories', createCategoryController);
router.get('/skill-categories', getAllCategoriesController);
router.get('/skill-categories/summary', getCategorySummariesController);
router.get('/skill-categories/:id', getCategoryByIdController);
router.put('/skill-categories/:id', updateCategoryController);
router.delete('/skill-categories/:id', deleteCategoryController);

// --- Skill Routes ---
router.post('/skills', uploadSkillImage, createSkillController);
router.put('/skills/:id', uploadSkillImage, updateSkillController);
router.delete('/skills/:id', deleteSkillController);

export default router;