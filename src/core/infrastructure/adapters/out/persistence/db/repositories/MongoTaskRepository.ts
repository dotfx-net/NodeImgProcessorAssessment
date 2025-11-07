import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { Task } from '@/core/domain/entities/Task';
import { TaskModel } from '../models/TaskModel';
import { TaskMapper } from '../mappers/TaskMapper';

export class MongoTaskRepository implements TaskRepository {
  async save(task: Task): Promise<Task> {
    try {
      const mongooseDoc = TaskMapper.toMongoose(task);
      const savedDoc = await TaskModel.create(mongooseDoc);

      return TaskMapper.toDomain(savedDoc);
    } catch (error) {
      throw new Error(`Failed to save task: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<Task | null> {
    try {
      const doc = await TaskModel.findById(id).lean();

      if (!doc) { return null;}

      return TaskMapper.toDomain(doc);
    } catch (error) {
      return null;
    }
  }

  async update(task: Task): Promise<Task> {
    try {
      const mongooseDoc = TaskMapper.toMongoose(task);
      const updatedDoc = await TaskModel.findByIdAndUpdate(
        task.id,
        { $set: mongooseDoc },
        { new: true }
      ).lean();

      if (!updatedDoc) { throw new Error(`Task with id ${task.id} not found`); }

      return TaskMapper.toDomain(updatedDoc);
    } catch (error) {
      throw new Error(`Failed to update task: ${(error as Error).message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await TaskModel.findByIdAndDelete(id);

      return result !== null;
    } catch (error) {
      return false;
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      const docs = await TaskModel.find().lean();

      return docs.map((doc) => TaskMapper.toDomain(doc));
    } catch (error) {
      throw new Error(`Failed to find tasks: ${(error as Error).message}`);
    }
  }
};
