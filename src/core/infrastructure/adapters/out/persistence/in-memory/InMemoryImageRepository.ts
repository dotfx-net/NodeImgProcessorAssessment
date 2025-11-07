import { ImageRepository } from '@/core/application/ports/out/ImageRepository';
import { Image } from '@/core/domain/entities/Image';

export class InMemoryImageRepository implements ImageRepository {
  private images: Map<string, Image> = new Map();
  private idCounter = 0;

  async save(image: Image): Promise<Image> {
    const id = image.id || this.generateId();
    const savedImage = new Image(
      id,
      image.taskId,
      image.name,
      image.mimeType,
      image.resolution,
      image.md5,
      image.path,
      image.createdAt
    );

    this.images.set(id, savedImage);

    return savedImage;
  }

  async findById(id: string): Promise<Image | null> { return this.images.get(id) || null; }
  async findByTaskId(taskId: string): Promise<Image[]> { return Array.from(this.images.values()).filter((img) => img.taskId === taskId); }
  async deleteByTaskId(taskId: string): Promise<number> {
    const toDelete = Array.from(this.images.values()).filter((img) => img.taskId === taskId);

    toDelete.forEach((img) => this.images.delete(img.id));

    return toDelete.length;
  }

  clear(): void {
    this.images.clear();
  }

  private generateId(): string { return String(++this.idCounter); }
};
