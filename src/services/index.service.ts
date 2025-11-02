import mongoose from 'mongoose';
import { TaskModel } from '../models/task.model';
import { ImageModel } from '../models/image.model';

export async function ensureIndexes(): Promise<void> {
  try {
    await Promise.all([
      TaskModel.createIndexes(),
      ImageModel.createIndexes()
    ]);

    console.log('Indexes created successfully');
  } catch (error: any) {
    console.error('Failed to create indexes:', error);
    throw error;
  }
}

export async function listIndexes(): Promise<void> {
  try {
    console.log('\n=== Task Indexes ===');
    const taskIndexes = await TaskModel.collection.getIndexes();
    console.log(JSON.stringify(taskIndexes, null, 2));

    console.log('\n=== Image Indexes ===');
    const imageIndexes = await ImageModel.collection.getIndexes();
    console.log(JSON.stringify(imageIndexes, null, 2));
  } catch (error: any) {
    console.error('Failed to list indexes:', error);
  }
}

export async function dropIndexes(): Promise<void> {
  try {
    await Promise.all([
      TaskModel.collection.dropIndexes(),
      ImageModel.collection.dropIndexes()
    ]);

    console.log('Indexes dropped');
  } catch (error: any) {
    console.error('Failed to drop indexes:', error);
    throw error;
  }
}

export async function getIndexStats(): Promise<any> {
  try {
    const db = mongoose.connection.db;

    if (!db) { throw new Error('Database not connected'); }

    const taskStats = await db.command({ collStats: 'tasks' });
    const imageStats = await db.command({ collStats: 'images' });

    return {
      tasks: {
        count: taskStats.count,
        size: taskStats.size,
        avgObjSize: taskStats.avgObjSize,
        indexCount: taskStats.nindexes,
        totalIndexSize: taskStats.totalIndexSize
      },
      images: {
        count: imageStats.count,
        size: imageStats.size,
        avgObjSize: imageStats.avgObjSize,
        indexCount: imageStats.nindexes,
        totalIndexSize: imageStats.totalIndexSize
      }
    };
  } catch (error: any) {
    console.error('Failed to get index stats:', error);

    throw error;
  }
}
