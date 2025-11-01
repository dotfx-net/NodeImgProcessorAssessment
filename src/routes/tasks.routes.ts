import { Router, Request, Response } from 'express';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const taskData = req.body;

  res.status(201).json({ taskId: '123', ...taskData, price: 1 });
});

router.get('/:taskId', (req: Request, res: Response) => {
  const { taskId } = req.params;

  res.json({ taskId, status: 'pending', price: 1 });
});

export default router;
