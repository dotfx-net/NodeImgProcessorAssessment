import { Task } from '../../domain/entities/Task';
import { GetTaskUseCase } from '../ports/in/GetTaskUseCase';
import { TaskRepository } from '../ports/out/TaskRepository';

export class GetTaskUseCaseImpl implements GetTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository
  ) {}

  async execute(taskId: string): Promise<Task | null> {
    const task = await this.taskRepository.findById(taskId);

    return task;
  }
};
