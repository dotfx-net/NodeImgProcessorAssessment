import { TaskStatus } from '@/core/domain/entities/Task';
import { randomInt } from '@/shared/utils/randomInt';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

interface TaskResponse {
  taskId?: string;
  status?: string;
  price?: number;
  images?: Array<{ resolution: string; path: string }>;
  error?: string;
}

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
      expect(data).toHaveProperty('status', TaskStatus.PENDING);
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
      expect(data.error).toContain('Validation error');
    });
  });

  describe('GET /tasks/:taskId', () => {
    it('should return task for valid taskId', async () => {
      const createResponse = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'https://picsum.photos/' + randomInt(1, 5_000) })
      });

      const createData = (await createResponse.json()) as TaskResponse;
      const taskId = createData.taskId;
      const response = await fetch(`${BASE_URL}/tasks/${taskId}`);

      expect(response.status).toBe(200);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('taskId', taskId);
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('price');
    });

    it('should return 404 for non-existent taskId', async () => {
      const response = await fetch(`${BASE_URL}/tasks/507f1f77bcf86cd799439011`);

      expect(response.status).toBe(404);

      const data = (await response.json()) as TaskResponse;
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('not found');
    });
  });

  describe('Complete Workflow', () => {
    it('should process task end-to-end and update status', async () => {
      const createResponse = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'https://picsum.photos/' + randomInt(1, 5_000) })
      });

      expect(createResponse.status).toBe(201);

      const createData = (await createResponse.json()) as TaskResponse;
      const taskId = createData.taskId!;

      expect(taskId).toBeDefined();
      expect(createData.status).toBe(TaskStatus.PENDING);

      let finalStatus: TaskResponse | null = null;
      let attempts = 0;
      const maxAttempts = 20;
      const pollInterval = 1_000; // 1 second

      while (!finalStatus && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));

        const statusResponse = await fetch(`${BASE_URL}/tasks/${taskId}`);
        expect(statusResponse.status).toBe(200);

        const statusData = (await statusResponse.json()) as TaskResponse;

        if (statusData.status !== TaskStatus.PENDING) { finalStatus = statusData; }

        attempts++;
      }

      expect(finalStatus).not.toBeNull();
      expect([TaskStatus.COMPLETED, TaskStatus.FAILED]).toContain(finalStatus!.status);

      if (finalStatus!.status === TaskStatus.COMPLETED) {
        expect(finalStatus!.images).toBeDefined();
        expect(finalStatus!.images!.length).toBeGreaterThan(0);

        finalStatus!.images!.forEach((image) => {
          expect(image).toHaveProperty('resolution');
          expect(image).toHaveProperty('path');
          expect(['800', '1024']).toContain(image.resolution);
          expect(image.path).toMatch(/^\/output\//);
        });

        console.log(`Task ${taskId} completed with ${finalStatus!.images!.length} images`);
      }

      if (finalStatus!.status === TaskStatus.FAILED) {
        expect(finalStatus!.error).toBeDefined();
        expect(typeof finalStatus!.error).toBe('string');
        expect(finalStatus!.error!.length).toBeGreaterThan(0);

        console.log(`❌ Task ${taskId} failed: ${finalStatus!.error}`);
      }
    }, 20*1_000); // 20 second timeout
  });
});
