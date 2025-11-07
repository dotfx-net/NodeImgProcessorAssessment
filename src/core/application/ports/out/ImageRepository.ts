import { Image } from '@/core/domain/entities/Image';

export interface ImageRepository {
  save(image: Image): Promise<Image>;
  findById(id: string): Promise<Image | null>;
};
