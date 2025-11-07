import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { ImageRepository } from '@/core/application/ports/out/ImageRepository';
import { ImageProcessor } from '@/core/application/ports/out/ImageProcessor';
import { PriceCalculator } from '@/core/application/ports/out/PriceCalculator';

import { CreateTaskUseCase } from '@/core/application/ports/in/CreateTaskUseCase';
import { GetTaskUseCase } from '@/core/application/ports/in/GetTaskUseCase';
import { ProcessImageUseCase } from '@/core/application/ports/in/ProcessImageUseCase';

import { CreateTaskUseCaseImpl } from '@/core/application/use-cases/CreateTaskUseCaseImpl';
import { GetTaskUseCaseImpl } from '@/core/application/use-cases/GetTaskUseCaseImpl';
import { ProcessImageUseCaseImpl } from '@/core/application/use-cases/ProcessImageUseCaseImpl';

import { MongoTaskRepository } from '@/core/infrastructure/adapters/out/persistence/db/repositories/MongoTaskRepository';
import { MongoImageRepository } from '@/core/infrastructure/adapters/out/persistence/db/repositories/MongoImageRepository';
import { SharpImageProcessor } from '@/core/infrastructure/adapters/out/image-processing/SharpImageProcessor';
import { RandomPriceCalculator } from '@/core/infrastructure/adapters/out/pricing/RandomPriceCalculator';

import { ensureIndexes } from '@/core/infrastructure/adapters/out/persistence/db/MongoIndexes';
import { config } from './config';

export class DIContainer {
  private static instance: DIContainer;

  private taskRepository: TaskRepository;
  private imageRepository: ImageRepository;

  private imageProcessor: ImageProcessor;
  private priceCalculator: PriceCalculator;

  private createTaskUseCase: CreateTaskUseCase;
  private getTaskUseCase: GetTaskUseCase;
  private processImageUseCase: ProcessImageUseCase;

  private constructor() {}

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) { DIContainer.instance = new DIContainer(); }

    return DIContainer.instance;
  }

  public async initialize(): Promise<void> {
    this.initializeAdapters();
    this.initializeUseCases();

    await ensureIndexes();
  }

  private initializeAdapters(): void {
    this.taskRepository = new MongoTaskRepository();
    this.imageRepository = new MongoImageRepository();
    this.priceCalculator = new RandomPriceCalculator(5, 50, 1);
    this.imageProcessor = new SharpImageProcessor(config?.processing?.output || 'output');
  }

  private initializeUseCases(): void {
    this.createTaskUseCase = new CreateTaskUseCaseImpl(this.taskRepository, this.priceCalculator);
    this.getTaskUseCase = new GetTaskUseCaseImpl(this.taskRepository);
    this.processImageUseCase = new ProcessImageUseCaseImpl(this.taskRepository, this.imageRepository, this.imageProcessor, config?.processing?.sizes || [1024, 800]);
  }

  public getCreateTaskUseCase(): CreateTaskUseCase { return this.createTaskUseCase; }
  public getGetTaskUseCase(): GetTaskUseCase { return this.getTaskUseCase; }
  public getProcessImageUseCase(): ProcessImageUseCase { return this.processImageUseCase; }
  public getTaskRepository(): TaskRepository { return this.taskRepository; }
  public getImageRepository(): ImageRepository { return this.imageRepository; }
};
