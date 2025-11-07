import { CreateTaskUseCaseImpl } from '@/core/application/use-cases/CreateTaskUseCaseImpl';
import { PriceCalculator } from '@/core/application/ports/out/PriceCalculator';
import { TaskStatus } from '@/core/domain/entities/Task';
import { InMemoryTaskRepository } from '@/core/infrastructure/adapters/out/persistence/in-memory/InMemoryTaskRepository';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCaseImpl;
  let mockTaskRepository: InMemoryTaskRepository;
  let mockPriceCalculator: PriceCalculator;

  beforeEach(() => {
    mockTaskRepository = new InMemoryTaskRepository();
    mockPriceCalculator = {
      calculate: jest.fn().mockReturnValue(25.5)
    };

    useCase = new CreateTaskUseCaseImpl(mockTaskRepository, mockPriceCalculator);
  });

  afterEach(() => {
    mockTaskRepository.clear();
  });

  it('should create a task with pending status', async () => {
    // arrange
    const source = 'https://example.com/image.jpg';

    // act
    const task = await useCase.execute(source);

    // assert
    expect(task).toBeDefined();
    expect(task.status).toBe(TaskStatus.PENDING);
    expect(task.originalPath).toBe(source);
    expect(task.price).toBe(25.5);
    expect(task.id).toBeDefined();
  });

  it('should save task to repository', async () => {
    // arrange
    const source = 'https://example.com/image.jpg';

    // act
    const task = await useCase.execute(source);

    // assert
    const savedTask = await mockTaskRepository.findById(task.id);
    expect(savedTask).toBeDefined();
    expect(savedTask?.originalPath).toBe(source);
  });

  it('should call price calculator', async () => {
    // arrange
    const source = 'https://example.com/image.jpg';

    // act
    await useCase.execute(source);

    // assert
    expect(mockPriceCalculator.calculate).toHaveBeenCalled();
  });
});
