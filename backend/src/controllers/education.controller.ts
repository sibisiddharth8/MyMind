import { Request, Response } from 'express';
import * as educationService from '../services/education.service';
import { EducationData } from '../services/education.service';
import fs from 'fs';
import path from 'path';

const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

export const createEducationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { institutionName, courseName, startDate, description, grade } = req.body;
        
        const requiredFields = { institutionName, courseName, startDate, description, grade };
        if (Object.values(requiredFields).some(field => !field)) {
            res.status(400).json({ message: "All text fields are required." });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: "Institution logo is a required file." });
            return;
        }

        const payload: EducationData = {
            ...req.body,
            logo: req.file.path.replace(/\\/g, "/"),
            startDate: new Date(startDate),
            endDate: req.body.endDate && req.body.endDate !== 'present' ? new Date(req.body.endDate) : null,
        };
        
        const education = await educationService.createEducation(payload);
        res.status(201).json({ message: "Education entry created successfully.", data: education });
    } catch (error) {
        res.status(500).json({ message: "Error creating education entry.", error });
    }
};

export const getAllEducationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const educations = await educationService.getAllEducations();
        res.status(200).json({ message: "Education entries retrieved successfully.", data: educations });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving education entries.", error });
    }
};

export const getEducationByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const education = await educationService.getEducationById(id);
        if (!education) {
            res.status(404).json({ message: "Education entry not found." });
        } else {
            res.status(200).json({ message: "Education entry retrieved successfully.", data: education });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving education entry.", error });
    }
};

// --- THIS FUNCTION IS NOW FULLY IMPLEMENTED ---
export const updateEducationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const oldEducation = await educationService.getEducationById(id);
        if (!oldEducation) {
            res.status(404).json({ message: "Education entry not found." });
            return;
        }
        
        const payload: EducationData = {};

        // Add text fields to payload if they were sent in the request
        const textFields: (keyof EducationData)[] = ['institutionName', 'courseName', 'description', 'grade', 'institutionLink'];
        textFields.forEach(field => {
            if (req.body[field] !== undefined) {
                payload[field] = req.body[field];
            }
        });
        
        if (req.body.startDate) payload.startDate = new Date(req.body.startDate);
        if (req.body.endDate !== undefined) {
            payload.endDate = req.body.endDate === 'present' ? null : new Date(req.body.endDate);
        }

        // Handle logo update or removal
        if (req.body.removeLogo === 'true') {
            deleteFile(oldEducation.logo);
            payload.logo = null;
        } else if (req.file) {
            deleteFile(oldEducation.logo);
            payload.logo = req.file.path.replace(/\\/g, "/");
        }

        if (Object.keys(payload).length === 0) {
            res.status(400).json({ message: "No update data provided." });
            return;
        }

        const updatedEducation = await educationService.updateEducation(id, payload);
        res.status(200).json({ message: "Education entry updated successfully.", data: updatedEducation });
    } catch (error) {
        res.status(500).json({ message: "Error updating education entry.", error });
    }
};

// --- THIS FUNCTION IS NOW FULLY IMPLEMENTED ---
export const deleteEducationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const education = await educationService.getEducationById(id);
        if (education) {
            deleteFile(education.logo);
            await educationService.deleteEducation(id);
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Education entry not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting education entry.", error });
    }
};