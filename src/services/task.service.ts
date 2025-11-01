import { isValidObjectId } from 'mongoose';
import { TaskModel, ITask } from '../models/task.model';

export function randomPrice(min: number, max: number) {
  const v = Math.random() * (max - min) + min;

  return Math.round(v * 10) / 10;
}

export async function createTask(url: string) {
  const task = await TaskModel.create({
    status: 'pending',
    price: randomPrice(5, 50),
    originalPath: url
  } as Partial<ITask>);

  return task;
}

export async function getTask(taskId: string) {
  if (!isValidObjectId(taskId)) { return null; }

  return TaskModel.findById(taskId).lean();
}
