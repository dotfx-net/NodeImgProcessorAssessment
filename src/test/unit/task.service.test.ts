import { randomPrice, createTask, getTask, markCompleted, markFailed } from '../../services/task.service';
import { TaskModel } from '../../models/task.model';

describe('Task service', () => {
  describe('randomPrice', () => {
    it('should generate a random price within the defined range', () => {
      const price = randomPrice(5, 50);

      expect(price).toBeGreaterThanOrEqual(5);
      expect(price).toBeLessThanOrEqual(50);
    });
  });

  describe('createTask', () => {
    it('should create a task with pending status', async () => {
      const url = 'https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg';
      const task = await createTask(url);

      expect(task).toBeDefined();
      expect(task.status).toBe('pending');
      expect(task.originalPath).toBe(url);
      expect(task.price).toBeGreaterThan(0);
    });

    it('should save task to database', async () => {
      const url = 'https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg';
      const task = await createTask(url);
      const found = await TaskModel.findById(String(task._id));

      expect(found).toBeDefined();
      expect(found?.originalPath).toBe(url);
    });
  });

  describe('getTask', () => {
    it('should return null for invalid ObjectId', async () => {
      const task = await getTask('invalid-id');

      expect(task).toBeNull();
    });

    it('should return null for non-existent task', async () => {
      const task = await getTask('507f1f77bcf86cd799439011');

      expect(task).toBeNull();
    });

    it('should return task for valid id', async () => {
      const created = await createTask('https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg');
      const task = await getTask(String(created._id));

      expect(task).toBeDefined();
      expect(task?.originalPath).toBe('https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg');
    });
  });

  describe('markCompleted', () => {
    it('should update task status to completed', async () => {
      const task = await createTask('https://upload.wikimedia.org/wikipedia/commons/2/28/JPG_Test.jpg');
      const images = [
        { resolution: '1024', path: '/output/JPG_Test/1024/329c23838da1c3887c003c8c583103d0.jpg' },
        { resolution: '800', path: '/output/JPG_Test/800/ece30196561278e682c7a83937a007b5.jpg' }
      ];

      const updated = await markCompleted(String(task._id), images);

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('completed');
      expect(updated?.images).toHaveLength(2);
      expect(updated?.images[0]?.resolution).toBe('1024');
    });
  });

  describe('markFailed', () => {
    it('should update task status to failed', async () => {
      const task = await createTask('https://example.com/non-existent-image.jpg');
      const error = 'Failed to process image';

      const updated = await markFailed(String(task._id), error);

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('failed');
      expect(updated?.error).toBe(error);
    });
  });
});
