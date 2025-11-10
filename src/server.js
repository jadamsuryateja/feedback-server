import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure dotenv with the correct path
dotenv.config({ path: join(__dirname, '../.env') });

import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import configRoutes from './routes/config.js';
import feedbackRoutes from './routes/feedback.js';

const app = express();
const httpServer = createServer(app);

// Get environment variables
const { PORT, HOST, CORS_ORIGIN } = process.env;

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "https://feedback-frontend-rdop.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Configure Express CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://feedback-frontend-rdop.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Add body parser middleware before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add preflight handling
app.options('*', cors({
  origin: process.env.CORS_ORIGIN || "https://feedback-frontend-rdop.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Update CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "https://feedback-frontend-rdop.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type", "Authorization"]
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Connect to MongoDB
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/feedback', feedbackRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join room based on role/branch
  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Handle configuration updates
  socket.on('config-updated', (data) => {
    // Notify specific branch
    if (data.branch) {
      io.to(`branch-${data.branch}`).emit('config-refresh');
    }
    
    // Notify admin
    io.to('admin').emit('config-refresh');
    
    // If BSH config, notify BSH users
    if (data.branch === 'BSH') {
      io.to('bsh').emit('config-refresh');
    }
  });

  // Handle new feedback submissions
  socket.on('feedback-submitted', (data) => {
    // Notify branch coordinator
    if (data.branch) {
      io.to(`branch-${data.branch}`).emit('feedback-refresh');
    }
    
    // Notify admin
    io.to('admin').emit('feedback-refresh');
    
    // If BSH feedback, notify BSH users
    if (data.branch === 'BSH') {
      io.to('bsh').emit('feedback-refresh');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const port = process.env.PORT || 4000;
// Always bind to 0.0.0.0 to work in containers
const host = '0.0.0.0';

httpServer.listen(port, host, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on http://${host}:${port}`);
});
