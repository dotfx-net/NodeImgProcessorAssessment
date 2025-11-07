import { Image } from '@/core/domain/entities/Image';

export interface ImageRepository {
  save(image: Image): Promise<Image>;
  findById(id: string): Promise<Image | null>;
  findByTaskId(taskId: string): Promise<Image[]>;
  deleteByTaskId(taskId: string): Promise<number>;
};
