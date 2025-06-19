import { Request, Response } from 'express';
import * as termsService from '../services/terms.service';
import { TermData } from '../services/terms.service';
import fs from 'fs';
import path from 'path';

// Helper function to delete a file if it exists
const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
};

export const createTermController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ message: "Fields 'title' and 'content' are required." });
            return;
        }
        const payload: TermData = { title, content };
        if (req.file) {
            payload.imagePath = req.file.path.replace(/\\/g, "/");
        }
        const term = await termsService.createTerm(payload);
        res.status(201).json({ message: "Term created successfully.", data: term });
    } catch (error) {
        res.status(500).json({ message: "Error creating term.", error });
    }
};

export const getAllTermsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const terms = await termsService.getAllTerms();
        res.status(200).json({ message: "Terms retrieved successfully.", data: terms });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving terms.", error });
    }
};

// --- THIS FUNCTION IS NOW FULLY IMPLEMENTED ---
export const updateTermController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const oldTerm = await termsService.getTermById(id);
        if (!oldTerm) {
            res.status(404).json({ message: "Term not found." });
            return;
        }

        const payload: TermData = {};

        if (req.body.title) payload.title = req.body.title;
        if (req.body.content) payload.content = req.body.content;

        // FIX: This new logic handles removing an existing image
        if (req.body.removeImage === 'true') {
            deleteFile(oldTerm.imagePath);
            payload.imagePath = null;
        } else if (req.file) {
            deleteFile(oldTerm.imagePath);
            payload.imagePath = req.file.path.replace(/\\/g, "/");
        }

        const updatedTerm = await termsService.updateTerm(id, payload);
        res.status(200).json({ message: "Term updated successfully.", data: updatedTerm });
    } catch (error) {
        console.error("--- ERROR UPDATING TERM ---", error);
        res.status(500).json({ message: "Error updating term.", error });
    }
};

// --- THIS FUNCTION IS NOW FULLY IMPLEMENTED ---
export const updateTermOrderController = async (req: Request, res: Response): Promise<void> => {
    try {
        // FIX: Correctly gets the array from the request body
        const { termOrders } = req.body;

        if (!Array.isArray(termOrders) || termOrders.length === 0) {
            res.status(400).json({ message: "Request body must be an array of { id, order } objects." });
            return;
        }
        await termsService.updateTermOrder(termOrders);
        res.status(200).json({ message: "Term order updated successfully." });
    } catch (error) {
        console.error("--- ERROR UPDATING TERM ORDER ---", error);
        res.status(500).json({ message: "Error updating term order.", error });
    }
};

export const deleteTermController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const term = await termsService.getTermById(id);
        if (term) {
            deleteFile(term.imagePath);
            await termsService.deleteTerm(id);
            res.status(204).send();
        } else {
            res.status(404).json({ message: "Term not found." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting term.", error });
    }
};