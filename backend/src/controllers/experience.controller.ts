import { Request, Response } from 'express';
import * as experienceService from '../services/experience.service';
import { ExperienceData } from '../services/experience.service';
import fs from 'fs';
import path from 'path';

const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

export const createExperienceController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role, companyName, startDate, description, skills, companyLink } = req.body;
        
        if (!role || !companyName || !startDate || !description || !skills) {
            res.status(400).json({ message: "Role, companyName, startDate, description, and skills are required fields." });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: "Company logo is a required file." });
            return;
        }

        const payload: ExperienceData = {
            role,
            companyName,
            description,
            companyLink: companyLink || null,
            logo: req.file.path.replace(/\\/g, "/"),
            startDate: new Date(startDate),
            endDate: req.body.endDate && req.body.endDate !== 'present' ? new Date(req.body.endDate) : null,
            skills: typeof skills === 'string' ? skills.split(',').map((s: string) => s.trim()) : skills,
        };
        
        const experience = await experienceService.createExperience(payload);
        res.status(201).json({ message: "Experience created successfully.", data: experience });

    } catch (error) {
        res.status(500).json({ message: "Error creating experience.", error });
    }
};

export const getAllExperiencesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const experiences = await experienceService.getAllExperiences();
        res.status(200).json({ message: "Experiences retrieved successfully.", data: experiences });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving experiences.", error });
    }
};

export const getExperienceByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const experience = await experienceService.getExperienceById(id);
        if (!experience) {
            res.status(404).json({ message: "Experience not found." });
        } else {
            res.status(200).json({ message: "Experience retrieved successfully.", data: experience });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving experience.", error });
    }
};

export const updateExperienceController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const payload: ExperienceData = {};

        // Dynamically add fields from body to payload if they exist
        Object.keys(req.body).forEach(key => {
            if (['role', 'companyName', 'description', 'companyLink'].includes(key)) {
                payload[key as keyof ExperienceData] = req.body[key];
            }
        });

        if (req.body.startDate) payload.startDate = new Date(req.body.startDate);
        if (req.body.endDate) {
            payload.endDate = req.body.endDate === 'present' ? null : new Date(req.body.endDate);
        }
        if (req.body.skills) {
            payload.skills = typeof req.body.skills === 'string' ? req.body.skills.split(',').map((s: string) => s.trim()) : req.body.skills;
        }
        if (req.file) {
            const oldExperience = await experienceService.getExperienceById(id);
            deleteFile(oldExperience?.logo);
            payload.logo = req.file.path.replace(/\\/g, "/");
        }

        if (Object.keys(payload).length === 0) {
            res.status(400).json({ message: "No update data provided." });
            return;
        }

        const updatedExperience = await experienceService.updateExperience(id, payload);
        res.status(200).json({ message: "Experience updated successfully.", data: updatedExperience });

    } catch (error) {
        res.status(500).json({ message: "Error updating experience.", error });
    }
};

export const deleteExperienceController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const experience = await experienceService.getExperienceById(id);
        if (experience) {
            deleteFile(experience.logo);
            await experienceService.deleteExperience(id);
            res.status(204).json({ message: "Experience deleted successfully." });
        } else {
            res.status(404).json({ message: "Experience not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting experience.", error });
    }
};