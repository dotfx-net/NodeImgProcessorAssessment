import { isValidObjectId } from 'mongoose';
import { TaskModel, ITask } from '../models/task.model';
import { IProcessedImage } from '../models/image.model';

export function randomPrice(min: number, max: number): number {
  const v = Math.random() * (max - min) + min;

  return Math.round(v * 10) / 10;
}

export async function createTask(url: string): Promise<ITask> {
  const task = await TaskModel.create({
    status: 'pending',
    price: randomPrice(5, 50),
    originalPath: url
  } as Partial<ITask>);

  return task;
}

export async function getTask(taskId: string): Promise<ITask | null> {
  if (!isValidObjectId(taskId)) { return null; }

  const task = await TaskModel.findById(taskId);

  if (!task) { return null; }

  return task;
}

export async function markCompleted(taskId: string, images: IProcessedImage[]): Promise<ITask | null> {
  return await TaskModel.findByIdAndUpdate(
    taskId,
    {
      $set: { status: 'completed', images },
      $currentDate: { updatedAt: true }
    },
    { new: true }
  );
}

export async function markFailed(taskId: string, error: string): Promise<ITask | null> {
  return await TaskModel.findByIdAndUpdate(
    taskId,
    {
      $set: { status: 'failed', error },
      $currentDate: { updatedAt: true }
    },
    { new: true }
  );
}
