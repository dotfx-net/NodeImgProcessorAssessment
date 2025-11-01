import { Request, Response, NextFunction } from 'express';
import { createTask, getTask, markCompleted, markFailed } from '../services/task.service';
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function postTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { source } = req.body as { source: string };
    const task = await createTask(source);

    // image service as background job here
    (async () => {
      try {
        await sleep(5_000);

        await markCompleted(String(task._id), []);
      } catch (error: any) {
        await markFailed(String(task._id), error?.message || 'Processing failed');
      }
    })();

    res.status(201).json({ taskId: String(task._id), status: task.status, price: task.price });
  } catch (error: any) {
    next(error);
  }
}
