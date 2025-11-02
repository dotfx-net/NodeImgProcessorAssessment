import { TaskResponse } from '../../controllers/tasks.controller';
import { randomInt } from '../../utils/randomInt';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

describe('E2E tests on real server', () => {
  describe('POST /tasks', () => {
    it('should create a new task with valid source', async () => {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'https://picsum.photos/' + randomInt(1, 5_000) })
      });

      expect(response.status).toBe(201);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('taskId');
      expect(data).toHaveProperty('status', 'pending');
      expect(data).toHaveProperty('price');
      expect(data.price).toBeGreaterThan(0);
    });

    it('should return 400 for missing source', async () => {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      expect(response.status).toBe(400);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Validation error');
    });

    it('should return 400 for empty source', async () => {
      const response = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: '' })
      });

      expect(response.status).toBe(400);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return task for valid taskId', async () => {
      // Create task first
      const createResponse = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'https://picsum.photos/' + randomInt(1, 5_000) })
      });

      const createData = (await createResponse.json()) as TaskResponse;
      const taskId = createData.taskId;

      // Get task
      const response = await fetch(`${BASE_URL}/tasks/${taskId}`);

      expect(response.status).toBe(200);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('taskId', taskId);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('price');
    });

    it('should return 400 for invalid taskId format', async () => {
      const response = await fetch(`${BASE_URL}/tasks/invalid-id`);

      expect(response.status).toBe(400);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Validation error');
    });

    it('should return 404 for non-existent taskId', async () => {
      const response = await fetch(`${BASE_URL}/tasks/507f1f77bcf86cd799439011`);

      expect(response.status).toBe(404);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('error', 'Task not found');
    });
  });

  describe('Complete workflow', () => {
    it('should process task and update status to completed or failed', async () => {
      // 1. Create task
      const createResponse = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'https://picsum.photos/' + randomInt(1, 5_000) })
      });

      expect(createResponse.status).toBe(201);

      const createData = (await createResponse.json()) as TaskResponse;
      const taskId = createData.taskId;

      // 2. Poll for completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 15;

      while (!completed && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1_000));

        const statusResponse = await fetch(`${BASE_URL}/tasks/${taskId}`);
        expect(statusResponse.status).toBe(200);

        const statusData = (await statusResponse.json()) as TaskResponse;

        if (statusData.status !== 'pending') {
          completed = true;

          // 3. Verify final status
          expect(['completed', 'failed']).toContain(statusData.status);

          if (statusData.status === 'completed') {
            // 4. Verify images were returned
            expect(statusData.images).toBeDefined();
            expect(statusData.images!.length).toBeGreaterThan(0);

            // 5. Verify each image has required fields
            statusData.images!.forEach((img: any) => {
              expect(img).toHaveProperty('resolution');
              expect(img).toHaveProperty('path');
              expect(['800', '1024']).toContain(img.resolution);
            });
          }

          if (statusData.status === 'failed') {
            // Verify error message exists
            expect(statusData.error).toBeDefined();
            expect(typeof statusData.error).toBe('string');
          }
        }

        attempts++;
      }

      expect(completed).toBe(true);
    }, 20*1_000); // 20 second timeout
  });
});
