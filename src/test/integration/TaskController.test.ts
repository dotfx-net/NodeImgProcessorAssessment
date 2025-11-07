import { Request, Response, NextFunction } from 'express';
import { TaskController } from '@/core/infrastructure/adapters/in/http/controllers/TaskController';
import { CreateTaskUseCase } from '@/core/application/ports/in/CreateTaskUseCase';
import { GetTaskUseCase } from '@/core/application/ports/in/GetTaskUseCase';
import { ProcessImageUseCase } from '@/core/application/ports/in/ProcessImageUseCase';
import { Task, TaskStatus } from '@/core/domain/entities/Task';

describe('TaskController Integration tests', () => {
  let controller: TaskController;
  let mockCreateTaskUseCase: jest.Mocked<CreateTaskUseCase>;
  let mockGetTaskUseCase: jest.Mocked<GetTaskUseCase>;
  let mockProcessImageUseCase: jest.Mocked<ProcessImageUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockCreateTaskUseCase = {
      execute: jest.fn()
    };

    mockGetTaskUseCase = {
      execute: jest.fn()
    };

    mockProcessImageUseCase = {
      execute: jest.fn()
    };

    controller = new TaskController(mockCreateTaskUseCase, mockGetTaskUseCase, mockProcessImageUseCase);

    mockRequest = {
      body: {},
      params: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('POST /tasks - createTask', () => {
    it('should create task and return 201 with taskId', async () => {
      // arrange
      const source = 'https://example.com/image.jpg';
      const task = new Task(
        '123',
        TaskStatus.PENDING,
        25.5,
        source,
        [],
        undefined,
        new Date(),
        new Date()
      );

      mockRequest.body = { source };
      mockCreateTaskUseCase.execute.mockResolvedValue(task);

      // act
      await controller.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // assert
      expect(mockCreateTaskUseCase.execute).toHaveBeenCalledWith(source);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        taskId: '123',
        status: TaskStatus.PENDING,
        price: 25.5
      });
    });

    it('should return 400 for empty source', async () => {
      // arrange
      const error = new Error('Source cannot be empty');
      mockRequest.body = { source: '' };
      mockCreateTaskUseCase.execute.mockRejectedValue(error);

      // act
      await controller.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should trigger background processing after creation', async () => {
      // arrange
      const source = 'https://example.com/image.jpg';
      const task = new Task(
        '123',
        TaskStatus.PENDING,
        25.5,
        source,
        [],
        undefined,
        new Date(),
        new Date()
      );

      mockRequest.body = { source };
      mockCreateTaskUseCase.execute.mockResolvedValue(task);

      // act
      await controller.createTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // assert
      expect(mockProcessImageUseCase.execute).toHaveBeenCalledWith('123', source);
    });
  });

  describe('GET /tasks/:taskId - getTask', () => {
    it('should return task with 200 when found', async () => {
      // arrange
      const taskId = '123';
      const task = new Task(
        taskId,
        TaskStatus.COMPLETED,
        25.5,
        'https://example.com/image.jpg',
        [
          { resolution: '1024', path: '/output/image/1024/hash.jpg' },
          { resolution: '800', path: '/output/image/800/hash.jpg' }
        ],
        undefined,
        new Date(),
        new Date()
      );

      mockRequest.params = { taskId };
      mockGetTaskUseCase.execute.mockResolvedValue(task);

      // act
      await controller.getTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // assert
      expect(mockGetTaskUseCase.execute).toHaveBeenCalledWith(taskId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        taskId: '123',
        status: TaskStatus.COMPLETED,
        price: 25.5,
        images: [
          { resolution: '1024', path: '/output/image/1024/hash.jpg' },
          { resolution: '800', path: '/output/image/800/hash.jpg' }
        ]
      });
    });

    it('should return 404 when task not found', async () => {
      // arrange
      const taskId = '999';
      mockRequest.params = { taskId };
      mockGetTaskUseCase.execute.mockResolvedValue(null);

      // act
      await controller.getTask(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Task not found'
      });
    });
  });
});
