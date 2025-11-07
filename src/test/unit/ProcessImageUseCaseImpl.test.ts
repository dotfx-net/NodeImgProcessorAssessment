import { ProcessImageUseCaseImpl } from '@/core/application/use-cases/ProcessImageUseCaseImpl';
import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { ImageRepository } from '@/core/application/ports/out/ImageRepository';
import { ImageProcessor } from '@/core/application/ports/out/ImageProcessor';
import { Task, TaskStatus } from '@/core/domain/entities/Task';

jest.mock('@/core/infrastructure/config/config', () => ({
  config: {
    processing: {
      sizes: [1024, 800],
      output: '/output'
    }
  }
}));

describe('ProcessImageUseCaseImpl', () => {
  let useCase: ProcessImageUseCaseImpl;
  let mockTaskRepository: jest.Mocked<TaskRepository>;
  let mockImageRepository: jest.Mocked<ImageRepository>;
  let mockImageProcessor: jest.Mocked<ImageProcessor>;

  beforeEach(() => {
    mockTaskRepository = {
      save: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    };

    mockImageRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByTaskId: jest.fn(),
      deleteByTaskId: jest.fn(),
    };

    mockImageProcessor = {
      loadImageBuffer: jest.fn(),
      processImage: jest.fn(),
      saveImage: jest.fn()
    };

    useCase = new ProcessImageUseCaseImpl(
      mockTaskRepository,
      mockImageRepository,
      mockImageProcessor
    );
  });

  describe('execute', () => {
    it('should process image and update task to completed', async () => {
      // arrange
      const taskId = '123';
      const source = 'https://example.com/image.jpg';
      const pendingTask = new Task(taskId, TaskStatus.PENDING, 25.5, source, [], undefined, new Date(), new Date());

      mockTaskRepository.findById.mockResolvedValue(pendingTask);
      mockImageProcessor.loadImageBuffer.mockResolvedValue({
        buffer: Buffer.from('fake-img-data'),
        name: 'image',
        mimeType: 'image/jpeg',
        ext: '.jpg'
      });

      mockImageProcessor.processImage.mockResolvedValue([
        { buffer: Buffer.from('1024'), resolution: '1024', format: 'jpeg', md5: 'hash1024', outputPath: '/output/image/1024/hash1024.jpg' },
        { buffer: Buffer.from('800'), resolution: '800', format: 'jpeg', md5: 'hash800', outputPath: '/output/image/800/hash800.jpg' }
      ]);

      mockImageProcessor.saveImage.mockResolvedValue('/output/image/1024/hash.jpg');
      mockImageRepository.save.mockImplementation(async (img) => ({ ...img, id: 'img123' }));

      // act
      await useCase.execute(taskId, source);

      // assert
      expect(mockImageProcessor.loadImageBuffer).toHaveBeenCalledWith(source);
      expect(mockImageProcessor.processImage).toHaveBeenCalled();
      expect(mockImageRepository.save).toHaveBeenCalledTimes(2);
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.COMPLETED,
          images: expect.arrayContaining([
            expect.objectContaining({ resolution: '1024' }),
            expect.objectContaining({ resolution: '800' })
          ])
        })
      );
    });

    it('should update task to failed on processing error', async () => {
      // arrange
      const taskId = '123';
      const source = 'https://invalid.com/image.jpg';
      const pendingTask = new Task(taskId, TaskStatus.PENDING, 25.5, source, [], undefined, new Date(), new Date());

      mockTaskRepository.findById.mockResolvedValue(pendingTask);
      mockImageProcessor.loadImageBuffer.mockRejectedValue(new Error('Failed to load image'));

      // act
      await expect(useCase.execute(taskId, source)).rejects.toThrow('Failed to load image');

      // assert
      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: TaskStatus.FAILED,
          error: expect.stringContaining('Failed to load image')
        })
      );
    });
  });
});
