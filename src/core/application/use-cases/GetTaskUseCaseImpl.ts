import { Task } from '../../domain/entities/Task';
import { GetTaskUseCase } from '../ports/in/GetTaskUseCase';
import { TaskRepository } from '../ports/out/TaskRepository';

export class GetTaskUseCaseImpl implements GetTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(taskId: string): Promise<Task | null> {
    if (taskId.trim() === '') { throw new Error('TaskId cannot be empty'); }

    const task = await this.taskRepository.findById(taskId);

    return task;
  }
};
