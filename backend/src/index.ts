import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // Import path
import aboutRoutes from './routes/about.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- ADD THIS LINE ---
// Serve static files from the 'images' directory
app.use('/images', express.static('images'));

// API Routes
app.use('/api', aboutRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Portfolio backend is running! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});