import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import Router from './routes/api.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url} | Headers: ${JSON.stringify(req.headers, null, 2)}`);
  next();
});

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'https://egpbtc.com', 'https://egpbtc.com/admin'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, path) => {
    console.log(`Serving static file: ${path}`);
    if (path.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
    }
  },
}));
app.use(express.static(path.join(__dirname, '../build/website')));
app.use('/admin', express.static(path.join(__dirname, '../build/dashboard')));

// API routes
app.use('/api', Router);

// Fallback for client-side routing
app.get('*', (req, res) => {
  try {
    if (req.url.startsWith('/admin') || req.url === '/auth' || req.url.startsWith('/verify-email') || req.url.startsWith('/reset-password')) {
      res.sendFile(path.join(__dirname, '../build/dashboard/index.html'));
    } else {
      res.sendFile(path.join(__dirname, '../build/website/index.html'));
    }
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