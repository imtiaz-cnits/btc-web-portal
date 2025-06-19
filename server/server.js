import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import Router from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url} | Headers: ${JSON.stringify(req.headers, null, 2)}`);
  next();
});

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', Router);

// Serve static files (after API routes to avoid conflicts)
app.use(express.static(path.join(__dirname, '../build/website')));
app.use('/admin', express.static(path.join(__dirname, '../build/dashboard')));

// Fallback for website client-side routing
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../build/website/index.html'));
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Server Error');
  }
});

const port = process.env.PORT || 3001;

connectDB()
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(port, () => console.log(`Server is running on port ${port}`));