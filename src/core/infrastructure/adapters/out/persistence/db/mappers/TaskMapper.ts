import { Task, TaskStatus } from '@/core/domain/entities/Task';

export class TaskMapper {
  // convert Mongoose document to Domain entity
  static toDomain(doc: any): Task {
    return new Task(
      String(doc._id),
      doc.status as TaskStatus,
      doc.price,
      doc.originalPath,
      doc.images || [],
      doc.error,
      new Date(doc.createdAt),
      new Date(doc.updatedAt)
    );
  }

  // convert Domain entity to Mongoose document
  static toMongoose(task: Task): any {
    const doc: any = {
      status: task.status,
      price: task.price,
      originalPath: task.originalPath,
      images: task.images,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };

    if (task.id !== '') { doc._id = task.id; }
    if (task.error !== '') { doc.error = task.error; }

    return doc;
  }
};
