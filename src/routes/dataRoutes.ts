import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/test', async (_req: Request, res: Response) => {
  try {
    res.json({ message: 'random text' });
  } catch (error) {
    res.status(500).json({ message: 'ошибка дурачок' });
  }
});

export default router;
