import { ProcessImageUseCase } from '@/core/application/ports/in/ProcessImageUseCase';
import { ImageProcessor } from '@/core/application/ports/out/ImageProcessor';
import { TaskRepository } from '@/core/application/ports/out/TaskRepository';
import { ImageRepository } from '@/core/application/ports/out/ImageRepository';
import { Image } from '@/core/domain/entities/Image';
import { TaskImage } from '@/core/domain/entities/Task';

export class ProcessImageUseCaseImpl implements ProcessImageUseCase {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly imageRepository: ImageRepository,
    private readonly imageProcessor: ImageProcessor,
    private readonly resolutions: number[] = [1024, 800]
  ) {}

  async execute(taskId: string, source: string): Promise<void> {
    try {
      const imageSource = await this.imageProcessor.loadImageBuffer(source);
      const processedImages = await this.imageProcessor.processImage(imageSource, this.resolutions);
      const images: TaskImage[] = [];

      for (const processedImage of processedImages) {
        const savedPath = await this.imageProcessor.saveImage(processedImage);
        const image = Image.create(taskId, imageSource.name, imageSource.mimeType, processedImage.resolution, processedImage.md5, savedPath);

        await this.imageRepository.save(image);

        images.push({ resolution: processedImage.resolution, path: savedPath });
      }

      const task = await this.taskRepository.findById(taskId);
      const completedTask = task.markAsCompleted(images);

      await this.taskRepository.update(completedTask);
    } catch (error: any) {
      const task = await this.taskRepository.findById(taskId);

      if (!!task) {
        const failedTask = task.markAsFailed(error.message);

        await this.taskRepository.update(failedTask);
      }

      throw error;
    }
  }
};
