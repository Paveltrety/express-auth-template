import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ message: 'Нет токена, доступ запрещен' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Неверный или просроченный токен' });
  }
};

export default authMiddleware;
