import request from 'supertest';
import { createServer } from '../../app';
import { TaskModel } from '../../models/task.model';

const app = createServer();

describe('Tasks API integration tests', () => {
  describe('POST /tasks', () => {
    it('should create a new task with valid source', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ source: 'https://picsum.photos/1' })
        .expect(201);

      expect(response.body).toHaveProperty('taskId');
      expect(response.body).toHaveProperty('status', 'pending');
      expect(response.body).toHaveProperty('price');
      expect(response.body.price).toBeGreaterThan(0);
    });

    it('should return 400 for missing source', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation error');
    });

    it('should return 400 for empty source', async () => {
      const response = await request(app)
        .post('/tasks')
        .send({ source: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return task for valid taskId', async () => {
      const createResponse = await request(app)
        .post('/tasks')
        .send({ source: 'https://picsum.photos/1' });

      const taskId = createResponse.body.taskId;
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .expect(200);

      expect(response.body).toHaveProperty('taskId', taskId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 400 for invalid taskId format', async () => {
      const response = await request(app)
        .get('/tasks/invalid-id')
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Validation error');
    });

    it('should return 404 for non-existent taskId', async () => {
      const response = await request(app)
        .get('/tasks/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Task not found');
    });

    it('should return images array for completed task', async () => {
      // create mocked completed task
      const task = await TaskModel.create({
        status: 'completed',
        price: 25.5,
        originalPath: 'https://example.com/image.jpg',
        images: [
          { resolution: '1024', path: '/output/image/1024/hash.jpg' },
          { resolution: '800', path: '/output/image/800/hash.jpg' }
        ]
      });

      const response = await request(app)
        .get(`/tasks/${task._id}`)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.images).toHaveLength(2);
      expect(response.body.images[0]).toHaveProperty('resolution');
      expect(response.body.images[0]).toHaveProperty('path');
    });
  });
});
