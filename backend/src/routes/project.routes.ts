import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { uploadProjectImage } from '../middleware/multer';
import {
    // Import all project and project-category controllers here
    createProjectController,
    getAllProjectsController,
    getRecentProjectsController,
    getProjectByIdController,
    updateProjectController,
    deleteProjectController,
    createProjectCategoryController,
    getAllProjectCategoriesController,
    updateProjectCategoryController,
    getProjectCategorySummariesController,
    deleteProjectCategoryController
} from '../controllers/project.controller';

const router = Router();

// Category Routes
router.get('/project-categories', getAllProjectCategoriesController);
router.get('/project-categories/summary', getProjectCategorySummariesController);
router.post('/project-categories', protect, createProjectCategoryController);
router.put('/project-categories/:id', protect, updateProjectCategoryController);
router.delete('/project-categories/:id', protect, deleteProjectCategoryController);

// Project Routes
router.get('/projects', getAllProjectsController);
router.get('/projects/recent', getRecentProjectsController);
router.get('/projects/:id', getProjectByIdController);
router.post('/projects', protect, uploadProjectImage, createProjectController);
router.put('/projects/:id', protect, uploadProjectImage, updateProjectController);
router.delete('/projects/:id', protect, deleteProjectController);

export default router;