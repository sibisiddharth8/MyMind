import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import aboutRoutes from './routes/about.routes';
import linksRoutes from './routes/links.routes';
import skillsRoutes from './routes/skills.routes';
import experienceRoutes from './routes/experience.routes';
import memberRoutes from './routes/member.routes';       
import projectRoutes from './routes/project.routes';
import educationRoutes from './routes/education.routes';
import contactRoutes from './routes/contact.routes';
import termsRoutes from './routes/terms.routes';
import publicUserRoutes from './routes/publicUser.routes';
import adminAuthRoutes from './routes/adminAuth.routes'; 


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/images', express.static('images'));

// API Routes
app.use('/api', publicUserRoutes);
app.use('/api', adminAuthRoutes);
app.use('/api', aboutRoutes);
app.use('/api', linksRoutes);
app.use('/api', skillsRoutes);
app.use('/api', experienceRoutes);
app.use('/api', memberRoutes);      
app.use('/api', projectRoutes);
app.use('/api', educationRoutes);
app.use('/api', contactRoutes);
app.use('/api', termsRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Portfolio backend is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});