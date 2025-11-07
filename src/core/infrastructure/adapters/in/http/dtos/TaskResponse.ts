import { Task, TaskStatus, TaskImage } from '@/core/domain/entities/Task';

export interface TaskResponse {
  taskId: string;
  status: TaskStatus;
  price: number;
  images?: TaskImage[];
  error?: string;
};

export class TaskResponseMapper {
  static fromTask(task: Task): TaskResponse {
    const response: TaskResponse = {
      taskId: task.id,
      status: task.status,
      price: task.price
    };

    if (task.isCompleted()) { response.images = task.images.map((image: TaskImage) => ({ resolution: image.resolution, path: image.path } as TaskImage)); }
    if (task.isFailed()) { response.error = task.error; }

    return response;
  }
};
