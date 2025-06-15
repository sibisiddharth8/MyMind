import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Helper function to create a storage engine for a specific path
const createStorage = (uploadPath: string) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// --- MULTER FOR 'ABOUT' SECTION ---
const aboutStorage = createStorage('images/about');
export const uploadAboutFiles = multer({
  storage: aboutStorage,
  // ... (keep the rest of the 'about' multer config the same)
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
]);


// --- NEW MULTER FOR 'SKILLS' SECTION ---
const skillsStorage = createStorage('images/skills');
export const uploadSkillImage = multer({
  storage: skillsStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 } // 2MB limit for skill icons
}).single('image'); // We only expect a single 'image' file for a skill