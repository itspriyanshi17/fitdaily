import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import logRoutes from './routes/log.js';
import workoutRoutes from './routes/workout.js';
import todoRoutes from './routes/todo.js';
import notificationRoutes from './routes/notifications.js';
import planRoutes from './routes/plan.js';
import { startNotificationScheduler } from './jobs/notificationScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/log', logRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/plan', planRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fitdaily')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startNotificationScheduler();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
