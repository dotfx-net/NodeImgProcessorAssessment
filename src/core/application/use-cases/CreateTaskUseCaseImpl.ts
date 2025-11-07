import { Task } from '@/core/domain/entities/Task';
import { CreateTaskUseCase } from '@/core/application/ports/in/CreateTaskUseCase';
import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { PriceCalculator } from '@/core/application/ports/out/PriceCalculator';

export class CreateTaskUseCaseImpl implements CreateTaskUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly priceCalculator: PriceCalculator
  ) {}

  async execute(source: string): Promise<Task> {
    const price = this.priceCalculator.calculate();
    const task = Task.create(source, price);
    const savedTask = await this.taskRepository.save(task);

    return savedTask;
  }
};
