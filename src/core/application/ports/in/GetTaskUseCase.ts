import { Task } from '@/core/domain/entities/Task';

export interface GetTaskUseCase {
  execute(taskId: string): Promise<Task | null>;
};
