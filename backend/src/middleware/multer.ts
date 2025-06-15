import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the path for uploads. This can be made more dynamic later if needed.
    const uploadPath = 'images/about';
    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create a unique filename to prevent overwrites
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Set up the multer instance with file filters for image and pdf
export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for the image field!'));
      }
    } else if (file.fieldname === 'cv') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for the CV field!'));
      }
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // 10 MB file size limit
  },
});

// Middleware to handle two files: 'image' and 'cv'
export const uploadFiles = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
]);