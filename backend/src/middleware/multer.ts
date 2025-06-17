import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Helper function (no changes)
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

// --- Existing Multer Instances (No changes) ---
const aboutStorage = createStorage('images/about');
export const uploadAboutFiles = multer({ storage: aboutStorage, /* ... */ }).fields([/* ... */]);

const skillsStorage = createStorage('images/skills');
export const uploadSkillImage = multer({ storage: skillsStorage, /* ... */ }).single('image');

const experienceStorage = createStorage('images/experience');
export const uploadExperienceLogo = multer({ storage: experienceStorage, /* ... */ }).single('logo');

const projectStorage = createStorage('images/projects');
export const uploadProjectImage = multer({ storage: projectStorage, /* ... */ }).single('projectImage');


// --- NEW MULTER FOR 'MEMBERS' SECTION ---
const memberStorage = createStorage('images/members');
export const uploadMemberImage = multer({
  storage: memberStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for the profile image!'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 } // 2MB limit
}).single('profileImage');

const educationStorage = createStorage('images/education');
export const uploadEducationLogo = multer({
  storage: educationStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for the logo!'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 2 } // 2MB limit for logos
}).single('logo');