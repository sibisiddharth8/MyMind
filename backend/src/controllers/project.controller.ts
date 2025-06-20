import { Request, Response } from 'express';
import * as projectService from '../services/project.service';
import fs from 'fs';
import path from 'path';

// Helper to delete files
const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

// =============================
// == CATEGORY CONTROLLERS    ==
// =============================

export const createProjectCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Category name is required.' });
            return;
        }
        const category = await projectService.createProjectCategory(name);
        res.status(201).json({ message: 'Project category created successfully.', data: category });
    } catch (error: any) {
        if (error.code === 'P2002') {
            res.status(409).json({ message: 'A project category with this name already exists.' });
        } else {
            res.status(500).json({ message: 'Error creating project category.', error });
        }
    }
};

export const getAllProjectCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await projectService.getAllProjectCategories();
        res.status(200).json({ message: 'Categories retrieved successfully.', data: categories });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categories.', error });
    }
};

export const getProjectCategorySummariesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const summaries = await projectService.getProjectCategorySummaries();
        res.status(200).json({ message: 'Summaries retrieved successfully.', data: summaries });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching summaries.', error });
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
            res.status(400).json({ message: 'Cannot delete category as it contains projects.' });
        } else {
            res.status(500).json({ message: 'Cannot delete category as it contains projects.', error });
        }
    }
};


// =============================
// ==    PROJECT CONTROLLERS    ==
// =============================

export const createProjectController = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Correctly destructure all expected fields from the form
        const { name, startDate, categoryId, tags, members, description, endDate, githubLink, liveLink } = req.body;

        if (!name || !startDate || !categoryId || !req.file) {
            res.status(400).json({ message: "name, startDate, categoryId, and projectImage are required." });
            return;
        }
        
        // 2. Safely parse the members JSON string
        let parsedMembers = [];
        if (members) {
            try {
                parsedMembers = JSON.parse(members);
            } catch (e) {
                res.status(400).json({ message: "The 'members' field contains invalid JSON." });
                return;
            }
        }

        const projectData = {
            name,
            description,
            githubLink,
            liveLink,
            startDate: new Date(startDate),
            categoryId,
            projectImage: req.file.path.replace(/\\/g, "/"),
            endDate: endDate && endDate !== 'present' ? new Date(endDate) : null,
            tags: typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).slice(0, 5) : [],
            members: parsedMembers
        };
        
        const project = await projectService.createProject(projectData);
        res.status(201).json({ message: "Project created successfully.", data: project });

    } catch (error) {
        // 3. Add detailed error logging for easier debugging
        console.error("--- ERROR CREATING PROJECT ---");
        console.error(error);
        console.error("------------------------------");
        res.status(500).json({ message: "Error creating project.", error });
    }
};

export const getAllProjectsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;
        const categoryId = req.query.categoryId as string | undefined;
        const name = req.query.name as string | undefined;
        const result = await projectService.getAllProjects({ page, limit, categoryId, name });
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

        if (tags) payload.tags = typeof tags === 'string' ? tags.split(',').map((t: string) => t.trim()).slice(0, 5) : tags;
        if (req.body.startDate) payload.startDate = new Date(req.body.startDate);
        if (req.body.endDate !== undefined) payload.endDate = req.body.endDate === 'present' ? null : new Date(req.body.endDate);

        if (req.file) {
            const oldProject = await projectService.getProjectById(id);
            deleteFile(oldProject?.projectImage);
            payload.projectImage = req.file.path.replace(/\\/g, "/");
        }
        if (req.body.removeProjectImage === 'true') {
            const oldProject = await projectService.getProjectById(id);
            deleteFile(oldProject?.projectImage);
            payload.projectImage = null;
        }
        
        if (members) {
             try {
                payload.members = JSON.parse(members);
            } catch (e) {
                res.status(400).json({ message: "The 'members' field contains invalid JSON." });
                return;
            }
        }
        
        const updatedProject = await projectService.updateProject(id, payload);
        res.status(200).json({ message: "Project updated successfully.", data: updatedProject });
    } catch (error) {
        console.error("--- ERROR UPDATING PROJECT ---");
        console.error(error);
        console.error("------------------------------");
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

export const updateProjectCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Category name is required.' });
            return;
        }
        const category = await projectService.updateProjectCategory({ id, name });
        res.status(200).json({ message: "Category updated successfully.", data: category });
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma code for record not found
            res.status(404).json({ message: "Category not found." });
        } else if (error.code === 'P2002') { // Unique constraint failed
             res.status(409).json({ message: 'A category with this name already exists.' });
        } else {
            console.error("--- ERROR UPDATING PROJECT CATEGORY ---", error);
            res.status(500).json({ message: "Error updating category.", error });
        }
    }
};