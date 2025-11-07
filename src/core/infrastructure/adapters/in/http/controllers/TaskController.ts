import { Request, Response, NextFunction } from 'express';
import { CreateTaskUseCase } from '@/core/application/ports/in/CreateTaskUseCase';
import { GetTaskUseCase } from '@/core/application/ports/in/GetTaskUseCase';
import { ProcessImageUseCase } from '@/core/application/ports/in/ProcessImageUseCase';
import { TaskResponseMapper } from '@/core/infrastructure/adapters/in/http/dtos/TaskResponse';

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly processImageUseCase: ProcessImageUseCase
  ) {}

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { source } = req.body;
      const task = await this.createTaskUseCase.execute(source);

      this.triggerBackgroundProcessing(task.id, source);

      const response = TaskResponseMapper.fromTask(task);

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { taskId } = req.params;

      const task = await this.getTaskUseCase.execute(taskId!);

      if (!task) {
        res.status(404).json({ error: 'Task not found' });
        return;
      }

      const response = TaskResponseMapper.fromTask(task);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  private triggerBackgroundProcessing(taskId: string, source: string): void {
    (async () => {
      try {
        await this.processImageUseCase.execute(taskId, source);
      } catch (error) {
        console.error(`Background processing failed for task ${taskId}:`, error);
      }
    })();
  }
};
