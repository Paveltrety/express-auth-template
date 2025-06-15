import express, { Express, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../contants/cookie';
import { tokenUtils } from '../utils/tokenUtils';

const router: Express = express();

const REFRESH_TOKENS_ERROR = 'REFRESH_TOKENS_ERROR';

// Регистрация
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Пользователь уже существует' });
      return;
    }
    const lastUser = await User.findOne().sort({ id: -1 }); // сортировка по убыванию
    const nextId = lastUser ? lastUser.id + 1 : 1;

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ id: nextId, email, password: hashedPassword });

    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

// Логин
router.post('/login', async (req: Request, res: Response) => {
  try {
    console.log(req.body, 'req.body');
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: 'Неверные учетные данные' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: 'Неверные учетные данные' });
      return;
    }

    const accessToken = tokenUtils.generateAccessToken(user);
    const refreshToken = tokenUtils.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    tokenUtils.setTokensToCookie({ res, accessToken, refreshToken });

    res.json({ userId: String(user.id) });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка входа' });
  }
});

// Обновление токенов
router.get('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'Нет refresh-токена' });
      return;
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      res.status(403).json({ message: 'Недействительный refresh-токен' });
      return;
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!, (err: jwt.VerifyErrors | null) => {
      if (err) {
        console.log(err, 'err in /refresh');
        return res.status(403).json({ message: REFRESH_TOKENS_ERROR });
      }

      const newAccessToken = tokenUtils.generateAccessToken(user);
      const newRefreshToken = tokenUtils.generateRefreshToken(user);

      user.refreshToken = newRefreshToken;
      user.save();

      tokenUtils.setTokensToCookie({ res, accessToken: newAccessToken, refreshToken: newRefreshToken });

      res.json({ message: 'Успешно' });
    });
  } catch (error) {
    res.status(500).json({ message: REFRESH_TOKENS_ERROR });
  }
});

// Выход
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ refreshToken: req.cookies.refreshToken });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE);
    res.clearCookie(ACCESS_TOKEN_COOKIE);
    res.json({ message: 'Выход выполнен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка выхода' });
  }
});

export default router;
