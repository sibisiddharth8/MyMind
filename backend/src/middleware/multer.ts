import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { Request } from 'express';

// Helper function to create a storage engine for a specific path.
const createStorage = (uploadPath: string) => {
  return multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// A generic file filter for images to keep our code DRY (Don't Repeat Yourself)
const imageFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed.'));
    }
};

// --- About Section Uploader ---
// Uses .any() to accept mixed text and file fields without errors.
export const uploadAboutFiles = multer({
  storage: createStorage('images/about'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 10 } // 10MB limit
}).any();

// --- Skills Section Uploader ---
export const uploadSkillImage = multer({
  storage: createStorage('images/skills'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 2 }
}).single('image');

// --- Experience Section Uploader ---
export const uploadExperienceLogo = multer({
  storage: createStorage('images/experience'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 2 }
}).single('logo');

// --- Projects Section Uploader ---
export const uploadProjectImage = multer({
  storage: createStorage('images/projects'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }
}).single('projectImage');

// --- Members Section Uploader ---
export const uploadMemberImage = multer({
  storage: createStorage('images/members'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 2 }
}).single('profileImage');

// --- Education Section Uploader ---
export const uploadEducationLogo = multer({
  storage: createStorage('images/education'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 2 }
}).single('logo');

// --- Terms Section Uploader ---
export const uploadTermImage = multer({
  storage: createStorage('images/terms'),
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 2 }
}).single('image');