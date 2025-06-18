import { Request, Response } from 'express';
import * as skillsService from '../services/skills.service';
import fs from 'fs';
import path from 'path';

// Helper to delete files
const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// =============================
// == CATEGORY CONTROLLERS    ==
// =============================

export const createCategoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ message: 'Category name is required.' });
        return;
    }
    const category = await skillsService.createCategory(name);
    // Return a consistent, wrapped response
    res.status(201).json({ message: "Category created successfully.", data: category });
  } catch (error: any) {
    if (error.code === 'P2002') { // Prisma unique constraint violation
        res.status(409).json({ message: 'A category with this name already exists.'});
    } else {
        res.status(500).json({ message: 'Error creating category', error });
    }
  }
};

export const getAllCategoriesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await skillsService.getAllCategoriesWithSkills();
    res.status(200).json({ message: "Skill categories retrieved successfully.", data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error });
  }
};

export const getCategorySummariesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const summaries = await skillsService.getCategorySummaries();
        res.status(200).json({ message: 'Category summaries retrieved successfully.', data: summaries });
    } catch (error) {
        res.status(500).json({ message: "Error fetching category summaries.", error });
    }
};

export const getCategoryByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await skillsService.getCategoryById(id);
        if (!category) {
            res.status(404).json({ message: "Category not found." });
        } else {
            res.status(200).json({ message: "Category retrieved successfully.", data: category });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching category.", error });
    }
};

export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ message: 'New category name is required.' });
        return;
    }
    const category = await skillsService.updateCategory(id, name);
    res.status(200).json({ message: "Category updated successfully.", data: category });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error });
  }
};

export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const category = await skillsService.getAllCategoriesWithSkills().then(cats => cats.find(c => c.id === id));
        // Delete all images associated with the skills in this category
        category?.skills.forEach(skill => deleteFile(skill.image));
        await skillsService.deleteCategory(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting category', error });
    }
};


// =============================
// ==    SKILL CONTROLLERS      ==
// =============================

export const createSkillController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
        res.status(400).json({ message: 'Skill name and categoryId are required.' });
        return;
    }
    if (!req.file) {
        res.status(400).json({ message: 'Skill image is required.' });
        return;
    }
    const imagePath = req.file.path.replace(/\\/g, "/");
    const skill = await skillsService.createSkill(name, imagePath, categoryId);
    res.status(201).json({ message: "Skill created successfully.", data: skill });
  } catch (error) {
    res.status(500).json({ message: 'Error creating skill', error });
  }
};

export const updateSkillController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const payload: { name?: string; image?: string } = {};

        if (name) payload.name = name;

        if (req.file) {
            const oldSkill = await skillsService.getSkillById(id);
            if (oldSkill) deleteFile(oldSkill.image);
            payload.image = req.file.path.replace(/\\/g, "/");
        }

        if (Object.keys(payload).length === 0) {
            res.status(400).json({ message: "No update data provided (name or image)." });
            return;
        }
        
        const updatedSkill = await skillsService.updateSkill(id, payload);
        res.status(200).json({ message: "Skill updated successfully.", data: updatedSkill });
    } catch (error) {
        res.status(500).json({ message: "Error updating skill", error });
    }
};

export const deleteSkillController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const skill = await skillsService.getSkillById(id);
        if (skill) deleteFile(skill.image);
        await skillsService.deleteSkill(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Error deleting skill", error });
    }
};