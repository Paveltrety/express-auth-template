import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import dataRoutes from './routes/dataRoutes';
import authMiddleware from './middlewares/authMiddleware';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cookieParser());

// Подключение к MongoDB
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log('✅ MongoDB подключена'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/data', authMiddleware, dataRoutes);

const PORT = process.env.PORT || 5002;
console.log(PORT, 'PORTTTT');
app.listen(PORT, () => console.log(`🚀 Сервер запущен на http://localhost:${PORT}`));
