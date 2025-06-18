import { Request, Response } from 'express';
import * as aboutService from '../services/about.service';
import { AboutData } from '../services/about.service';
import fs from 'fs';
import path from 'path';

// Helper function to delete a file if it exists
const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// --- GET CONTROLLER ---
export const getAboutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const about = await aboutService.getAbout();
    if (!about) {
      res.status(404).json({ message: 'About information not found. Please create it.' });
    } else {
      res.status(200).json({ message: "About data retrieved successfully.", data: about });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error });
  }
};

// --- UPSERT CONTROLLER ---
export const upsertAboutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingData = await aboutService.getAbout();

    if (!existingData && (!req.body.name || !req.body.roles || !req.body.description)) {
      res.status(400).json({ message: 'When creating, name, roles, and description are all required.' });
      return;
    }

    const payload: Partial<AboutData> = {};

    if (req.body.name) payload.name = req.body.name;
    if (req.body.description) payload.description = req.body.description;
    if (req.body.roles) {
      payload.roles = typeof req.body.roles === 'string'
        ? req.body.roles.split(',').map((r: string) => r.trim())
        : req.body.roles;
    }

    const files = req.files as Express.Multer.File[] | undefined;
    const imageFile = files?.find(f => f.fieldname === 'image');
    const cvFile = files?.find(f => f.fieldname === 'cv');

    if (req.body.removeImage === 'true') {
      deleteFile(existingData?.image);
      payload.image = null;
    } else if (imageFile) {
      deleteFile(existingData?.image);
      payload.image = imageFile.path.replace(/\\/g, '/');
    }

    if (req.body.removeCv === 'true') {
      deleteFile(existingData?.cv);
      payload.cv = null;
    } else if (cvFile) {
      deleteFile(existingData?.cv);
      payload.cv = cvFile.path.replace(/\\/g, '/');
    }

    const result = await aboutService.upsertAbout(payload, existingData);
    const statusCode = existingData ? 200 : 201;
    res.status(statusCode).json({ message: "About section updated successfully.", data: result });
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

// --- DELETE CONTROLLER ---
export const deleteAboutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingData = await aboutService.getAbout();
    if (existingData) {
      deleteFile(existingData.image ?? undefined);
      deleteFile(existingData.cv ?? undefined);

      await aboutService.deleteAbout();
      res.status(204).send();
    } else {
      res.status(404).json({ message: "About data not found. Nothing to delete." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting About data.", error });
  }
};
