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
    origin: [CORS_ORIGIN],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Configure CORS for Express
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/feedback', feedbackRoutes);

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

httpServer.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
