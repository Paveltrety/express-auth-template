import { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

import { Response } from 'express';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../contants/cookie';

interface ISetTokensToCookieParams {
  res: Response;
  accessToken: string;
  refreshToken: string;
}

const setTokensToCookie = ({ res, accessToken, refreshToken }: ISetTokensToCookieParams) => {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { httpOnly: true, secure: true, sameSite: 'none' });
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 15 * 60 * 1000, // 15 минут
  });
};

const generateAccessToken = (user: IUser): string => {
  const secretKey = process.env.JWT_SECRET;
  const expiresIn = process.env.ACCESS_TOKEN_EXPIRES as '15m';

  if (!secretKey) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn });
};

const generateRefreshToken = (user: IUser): string => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES as '7d';

  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn });
};

export const tokenUtils = {
  generateAccessToken,
  generateRefreshToken,
  setTokensToCookie,
};
