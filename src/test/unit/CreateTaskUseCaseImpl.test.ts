import { CreateTaskUseCaseImpl } from '@/core/application/use-cases/CreateTaskUseCaseImpl';
import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { PriceCalculator } from '@/core/application/ports/out/PriceCalculator';
import { Task, TaskStatus } from '@/core/domain/entities/Task';

describe('CreateTaskUseCaseImpl', () => {
  let useCase: CreateTaskUseCaseImpl;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockPriceCalculator: jest.Mocked<PriceCalculator>;

  beforeEach(() => {
    mockTaskRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockPriceCalculator = {
      calculate: jest.fn()
    };

    useCase = new CreateTaskUseCaseImpl(mockTaskRepository, mockPriceCalculator);
  });

  describe('execute', () => {
    it('should create task with pending status and calculated price', async () => {
      // arrange
      const source = 'https://example.com/image.jpg';
      const price = 25.5;

      mockPriceCalculator.calculate.mockReturnValue(price);
      mockTaskRepository.save.mockImplementation(async (task) => new Task('123', task.status, task.price, task.originalPath, [], undefined, new Date(), new Date()));

      // act
      const result = await useCase.execute(source);

      // assert
      expect(mockPriceCalculator.calculate).toHaveBeenCalled();
      expect(mockTaskRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.PENDING,
          price: 25.5,
          originalPath: source
        })
      );
      expect(result.id).toBe('123');
      expect(result.status).toBe(TaskStatus.PENDING);
      expect(result.price).toBe(price);
    });

    it('should throw error if source is empty', async () => {
      // act + assert
      await expect(useCase.execute('')).rejects.toThrow('Source cannot be empty');
      expect(mockTaskRepository.save).not.toHaveBeenCalled();
    });
  });
});
