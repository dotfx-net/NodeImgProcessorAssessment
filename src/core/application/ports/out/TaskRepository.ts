import { Task } from '@/core/domain/entities/Task';

export interface TaskRepository {
  save(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<Task[]>;
};
