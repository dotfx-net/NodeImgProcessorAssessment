import { Request, Response, NextFunction } from 'express';
import { createTask, getTask } from '../services/task.service.js';
import type { TaskStatus } from '../models/task.model';

interface TaskResponse {
  taskId: string;
  status: TaskStatus;
  price: number;
  images?: Array<{ resolution: string; path: string }>;
  error?: string;
};

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    const { taskId } = req.params as { taskId: string };
    const task = await getTask(taskId);

    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const response: TaskResponse = {
      taskId: String(task._id),
      status: task.status,
      price: task.price
    };

    switch(task.status) {
      case 'completed':
        response.images = task.images ?? [];
        break;

      case 'failed':
        response.error = task.error ?? 'Unknown error';
        break;
    }

    res.json(response);
  } catch (error: any) {
    next(error);
  }
}

export async function postTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { source } = req.body as { source: string };
    const task = await createTask(source);

    // image service as background job here

    res.status(201).json({ taskId: String(task._id), status: task.status, price: task.price });
  } catch (error: any) {
    next(error);
  }
}
