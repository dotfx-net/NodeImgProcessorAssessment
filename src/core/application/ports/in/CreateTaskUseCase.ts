import { Task } from '@/core/domain/entities/Task';

export interface CreateTaskUseCase {
  execute(source: string): Promise<Task>;
};
