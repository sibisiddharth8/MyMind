import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import fs from 'fs';
import path from 'path';

const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

// ===================================
// == PROJECT CATEGORY CONTROLLERS  ==
// ===================================

export const createProjectCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Category name is a required field.' });
            return;
        }
        const category = await projectService.createProjectCategory(name);
        res.status(201).json({ message: 'Project category created successfully.', data: category });
    } catch (error: any) {
        if (error.code === 'P2002') { // Prisma unique constraint violation
            res.status(409).json({ message: 'A project category with this name already exists.' });
        } else {
            res.status(500).json({ message: 'Error creating project category.', error });
        }
    }
};

export const getAllProjectCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await projectService.getAllProjectCategories();
        res.status(200).json({ message: "Project categories retrieved successfully.", data: categories });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving project categories.', error });
    }
};

export const getProjectCategorySummariesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const summaries = await projectService.getProjectCategorySummaries();
        res.status(200).json({ message: "Project category summaries retrieved successfully.", data: summaries });
    } catch (error) {
        res.status(500).json({ message: "Error fetching category summaries.", error });
    }
};

export const deleteProjectCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await projectService.deleteProjectCategory(id);
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') { // Record to delete does not exist
            res.status(404).json({ message: 'Project category not found.' });
        } else if (error.code === 'P2003') { // Foreign key constraint failed (onDelete: Restrict)
            res.status(400).json({ message: 'Cannot delete category. It still contains projects.', details: 'Please move or delete the projects in this category first.' });
        } else {
            res.status(500).json({ message: 'Error deleting project category.', error });
        }
    }
};


// ===================================
// ==      PROJECT CONTROLLERS      ==
// ===================================

export const createProjectController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, startDate, categoryId, tags, members, ...rest } = req.body;
        if (!name || !startDate || !categoryId || !req.file) {
            res.status(400).json({ message: "name, startDate, categoryId, and projectImage are required." });
            return;
        }

        const projectData = {
            ...rest,
            name,
            startDate: new Date(startDate),
            categoryId,
            projectImage: req.file.path.replace(/\\/g, "/"),
            endDate: req.body.endDate && req.body.endDate !== 'present' ? new Date(req.body.endDate) : null,
            tags: typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).slice(0, 5) : (tags || []),
            members: members ? JSON.parse(members) : [] // Expecting a JSON string for members
        };
        
        const project = await projectService.createProject(projectData);
        res.status(201).json({ message: "Project created successfully.", data: project });
    } catch (error) {
        res.status(500).json({ message: "Error creating project.", error });
    }
};

export const getAllProjectsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const categoryId = req.query.categoryId as string | undefined;
        const name = req.query.name as string | undefined; // <-- ADD THIS

        const result = await projectService.getAllProjects({ page, limit, categoryId, name }); // <-- PASS IT
        res.status(200).json({ message: "Projects retrieved successfully.", ...result });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving projects.", error });
    }
};

export const getRecentProjectsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const projects = await projectService.getRecentProjects(limit);
        res.status(200).json({ message: "Recent projects retrieved successfully.", data: projects });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving recent projects.", error });
    }
};

export const getProjectByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const project = await projectService.getProjectById(id);
        if (!project) {
            res.status(404).json({ message: "Project not found." });
        } else {
            res.status(200).json({ message: "Project retrieved successfully.", data: project });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving project.", error });
    }
};

export const updateProjectController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { tags, members, ...rest } = req.body;
        const payload: { [key: string]: any } = { ...rest };

        if (tags) {
            payload.tags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).slice(0, 5) : tags;
        }

        if (req.file) {
            const oldProject = await projectService.getProjectById(id);
            deleteFile(oldProject?.projectImage);
            payload.projectImage = req.file.path.replace(/\\/g, "/");
        }
        
        // Members must be passed as a JSON string in multipart form
        if (members) {
            payload.members = JSON.parse(members);
        }

        if (Object.keys(payload).length === 0) {
            res.status(400).json({ message: "No update data provided." });
            return;
        }

        const updatedProject = await projectService.updateProject(id, payload);
        res.status(200).json({ message: "Project updated successfully.", data: updatedProject });

    } catch (error) {
        res.status(500).json({ message: "Error updating project.", error });
    }
};

export const deleteProjectController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const project = await projectService.getProjectById(id);
        if (project) {
            deleteFile(project.projectImage);
            await projectService.deleteProject(id);
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Project not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting project.", error });
    }
};