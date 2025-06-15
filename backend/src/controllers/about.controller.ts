import { Request, Response } from 'express';
import * as aboutService from '../services/about.service';
import { AboutData } from '../services/about.service';
import fs from 'fs';
import path from 'path';

// Helper function to delete a file if it exists
const deleteFile = (filePath: string | null | undefined) => {
  if (!filePath) return;
  // Construct the full path from the project root
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${fullPath}`, err);
      }
    });
  }
};

export const getAboutController = async (req: Request, res: Response): Promise<void> => {
    // This function remains the same
    try {
        const about = await aboutService.getAbout();
        if (!about) {
            res.status(404).json({ message: 'About information not found.' });
        } else {
            res.status(200).json(about);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error });
    }
};

export const upsertAboutController = async (req: Request, res: Response): Promise<void> => {
  try {
    const existingData = await aboutService.getAbout();

    // If creating for the first time, all core fields are required.
    if (!existingData) {
      const { name, roles, description } = req.body;
      if (!name || !roles || !description) {
        res.status(400).json({ message: 'When creating, name, roles, and description are all required.' });
        return;
      }
    }

    const payload: Partial<AboutData> = {};

    // Handle text fields, allowing them to be set to null or an empty string to delete them.
    ['name', 'roles', 'description'].forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'roles') {
          payload.roles = typeof req.body.roles === 'string'
            ? req.body.roles.split(',').filter((r: string) => r).map((r: string) => r.trim())
            : req.body.roles;
        } else {
          payload[field as keyof Omit<AboutData, 'roles'>] = req.body[field];
        }
      }
    });

    // Handle file fields
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (files?.image) {
      deleteFile(existingData?.image); // Delete old file
      payload.image = files.image[0].path.replace(/\\/g, '/'); // Store new path
    } else if (req.body.image === null) {
      deleteFile(existingData?.image); // Delete file if set to null
      payload.image = null;
    }

    if (files?.cv) {
      deleteFile(existingData?.cv); // Delete old file
      payload.cv = files.cv[0].path.replace(/\\/g, '/'); // Store new path
    } else if (req.body.cv === null) {
      deleteFile(existingData?.cv); // Delete file if set to null
      payload.cv = null;
    }
    
    const result = await aboutService.upsertAbout(payload, existingData);
    const statusCode = existingData ? 200 : 201;
    res.status(statusCode).json(result);

  } catch (error: any) {
    res.status(500).json({ message: 'Error processing request', error: error.message });
  }
};

export const deleteAboutController = async (req: Request, res: Response): Promise<void> => {
    // When deleting the whole section, also delete its associated files
    const existingData = await aboutService.getAbout();
    deleteFile(existingData?.image);
    deleteFile(existingData?.cv);

    try {
        await aboutService.deleteAbout();
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'About section not found.') {
            res.status(404).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Error deleting data', error: error.message });
        }
    }
};