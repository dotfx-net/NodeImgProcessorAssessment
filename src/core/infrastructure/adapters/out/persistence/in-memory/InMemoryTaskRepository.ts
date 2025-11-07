import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { Task } from '@/core/domain/entities/Task';

export class InMemoryTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 0;

  async save(task: Task): Promise<Task> {
    const id = task.id || this.generateId();
    const savedTask = new Task(
      id,
      task.status,
      task.price,
      task.originalPath,
      task.images,
      task.error,
      task.createdAt,
      task.updatedAt
    );

    this.tasks.set(id, savedTask);

    return savedTask;
  }

  async findAll(): Promise<Task[]> { return Array.from(this.tasks.values()); }
  async findById(id: string): Promise<Task | null> { return this.tasks.get(id) || null; }

  async update(task: Task): Promise<Task> {
    this.tasks.set(task.id, task);

    return task;
  }

  async delete(id: string): Promise<boolean> { return this.tasks.delete(id); }

  clear(): void {
    this.tasks.clear();
    this.idCounter = 1;
  }

  private generateId(): string { return String(++this.idCounter); }
};
