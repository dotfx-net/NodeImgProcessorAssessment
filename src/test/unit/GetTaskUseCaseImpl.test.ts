import { GetTaskUseCaseImpl } from '@/core/application/use-cases/GetTaskUseCaseImpl';
import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { Task, TaskStatus } from '@/core/domain/entities/Task';

describe('GetTaskUseCaseImpl', () => {
  let useCase: GetTaskUseCaseImpl;
  let mockTaskRepository: jest.Mocked<TaskRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    useCase = new GetTaskUseCaseImpl(mockTaskRepository);
  });

  describe('execute', () => {
    it('should return task when found', async () => {
      // arrange
      const taskId = '123';
      const task = new Task(taskId, TaskStatus.COMPLETED, 25.5, 'https://example.com/image.jpg', [], undefined, new Date(), new Date());

      mockTaskRepository.findById.mockResolvedValue(task);

      // act
      const result = await useCase.execute(taskId);

      // assert
      expect(mockTaskRepository.findById).toHaveBeenCalledWith(taskId);
      expect(result).toBe(task);
    });

    it('should return null when task not found', async () => {
      // arrange
      mockTaskRepository.findById.mockResolvedValue(null);

      // act
      const result = await useCase.execute('999');

      // assert
      expect(result).toBeNull();
    });

    it('should throw error if taskId is empty', async () => {
      // act + assert
      await expect(useCase.execute('')).rejects.toThrow('TaskId cannot be empty');
      expect(mockTaskRepository.findById).not.toHaveBeenCalled();
    });
  });
});
