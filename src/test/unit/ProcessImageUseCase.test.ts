import { ProcessImageUseCaseImpl } from '@/core/application/use-cases/ProcessImageUseCaseImpl';
import { ImageProcessor, ImageBuffer, ProcessedImage } from '@/core/application/ports/out/ImageProcessor';
import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { ImageRepository } from '@/core/application/ports/out/ImageRepository';
import { Task, TaskStatus } from '@/core/domain/entities/Task';
import { Image } from '@/core/domain/entities/Image';

class MockImageProcessor implements ImageProcessor {
  async loadImageBuffer(_source: string): Promise<ImageBuffer> {
    return {
      buffer: Buffer.from('fake-img-data'),
      name: 'test-image',
      mimeType: 'image/jpeg',
      ext: '.jpg'
    };
  }

  async processImage(_imageBuffer: ImageBuffer, resolutions: number[]): Promise<ProcessedImage[]> {
    return resolutions.map((w) => ({
      buffer: Buffer.from('resized-data'),
      resolution: String(w),
      md5: `hash_${w}`,
      format: 'jpeg',
      outputPath: `/output/test/${w}/hash.jpg`
    }));
  }

  async saveImage(processedImage: ProcessedImage): Promise<string> { return processedImage.outputPath; }
};

class MockTaskRepository implements TaskRepository {
  private tasks: Map<string, Task> = new Map();

  async save(task: Task): Promise<Task> {
    const savedTask = new Task(
      '123',
      task.status,
      task.price,
      task.originalPath,
      task.images,
      task.error,
      task.createdAt,
      task.updatedAt
    );

    this.tasks.set(savedTask.id, savedTask);

    return savedTask;
  }

  async findById(id: string): Promise<Task | null> { return this.tasks.get(id) || null; }

  async update(task: Task): Promise<Task> {
    this.tasks.set(task.id, task);

    return task;
  }

  async delete(_id: string): Promise<boolean> { return true; }
  async findAll(): Promise<Task[]> { return []; }
};

class MockImageRepository implements ImageRepository {
  async save(image: any): Promise<any> { return image; }
  async findById(_id: string): Promise<Image | null> { return null; }
  async findByTaskId(_taskId: string): Promise<Image[]> { return []; }
  async deleteByTaskId(_taskId: string): Promise<number> { return 0; }
};

describe('ProcessImageUseCase', () => {
  let useCase: ProcessImageUseCaseImpl;
  let mockTaskRepository: MockTaskRepository;
  let mockImageRepository: MockImageRepository;
  let mockImageProcessor: MockImageProcessor;

  beforeEach(() => {
    mockTaskRepository = new MockTaskRepository();
    mockImageRepository = new MockImageRepository();
    mockImageProcessor = new MockImageProcessor();
    useCase = new ProcessImageUseCaseImpl(
      mockTaskRepository,
      mockImageRepository,
      mockImageProcessor,
      [1024, 800]
    );
  });

  it('should process image and mark task as completed', async () => {
    // arrange
    const task = Task.create('https://example.com/image.jpg', 25.5);
    const savedTask = await mockTaskRepository.save(task);

    // act
    await useCase.execute(savedTask.id, 'https://example.com/image.jpg');

    // assert
    const updatedTask = await mockTaskRepository.findById(savedTask.id);

    expect(updatedTask).toBeDefined();
    expect(updatedTask?.status).toBe(TaskStatus.COMPLETED);
    expect(updatedTask?.images).toHaveLength(2);
  });

  it('should mark task as failed on error', async () => {
    // arrange
    const task = Task.create('https://example.com/image.jpg', 25.5);
    const savedTask = await mockTaskRepository.save(task);

    // act (mock error)
    jest.spyOn(mockImageProcessor, 'loadImageBuffer').mockRejectedValue(new Error('Load failed'));

    // act + assert
    await expect(useCase.execute(savedTask.id, 'invalid-source')).rejects.toThrow();

    const updatedTask = await mockTaskRepository.findById(savedTask.id);

    expect(updatedTask?.status).toBe(TaskStatus.FAILED);
    expect(updatedTask?.error).toContain('Load failed');
  });
});
