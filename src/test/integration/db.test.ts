import mongoose from 'mongoose';
import { MongoTaskRepository } from '@/core/infrastructure/adapters/out/persistence/db/repositories/MongoTaskRepository';
import { Task, TaskStatus, TaskImage } from '@/core/domain/entities/Task';

describe('Database Integration tests', () => {
  let taskRepository: MongoTaskRepository;

  beforeAll(() => {
    taskRepository = new MongoTaskRepository();
  });

  afterEach(async () => {
    await mongoose.connection.collection('tasks').deleteMany({});
  });

  it('should be connected to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  it('should have valid database connection', () => {
    expect(mongoose.connection.db).toBeDefined();
  });

  it('should save and retrieve task from database', async () => {
    const task = Task.create('https://example.com/image.jpg', 25.5);
    const savedTask = await taskRepository.save(task);

    expect(savedTask.id).toBeDefined();

    const found = await taskRepository.findById(savedTask.id);

    expect(found).toBeDefined();
    expect(found?.status).toBe(TaskStatus.PENDING);
    expect(found?.price).toBe(25.5);
  });

  it('should update task status in database', async () => {
    const task = Task.create('https://example.com/image.jpg', 25.5);
    const savedTask = await taskRepository.save(task);

    const images: TaskImage[] = [{ resolution: '800', path: '/output/image/800/hash800.jpg' }];
    const completedTask = savedTask.markAsCompleted(images);

    await taskRepository.update(completedTask);

    const found = await taskRepository.findById(completedTask.id);

    expect(found?.status).toBe(TaskStatus.COMPLETED);
    expect(found?.images).toHaveLength(1);
  });

  it('should return null for non-existent task', async () => {
    const task = await taskRepository.findById('507f1f77bcf86cd799439011');

    expect(task).toBeNull();
  });
});
