import { ImageRepository } from '@/core/application/ports/out/ImageRepository';
import { Image } from '@/core/domain/entities/Image';
import { ImageModel } from '../models/ImageModel';
import { ImageMapper } from '../mappers/ImageMapper';

export class MongoImageRepository implements ImageRepository {
  async save(image: Image): Promise<Image> {
    try {
      const mongooseDoc = ImageMapper.toMongoose(image);
      const savedDoc = await ImageModel.create(mongooseDoc);

      return ImageMapper.toDomain(savedDoc);
    } catch (error) {
      throw new Error(`Failed to save image: ${(error as Error).message}`);
    }
  }

  async findById(id: string): Promise<Image | null> {
    try {
      const doc = await ImageModel.findById(id).lean();

      if (!doc) { return null; }

      return ImageMapper.toDomain(doc);
    } catch (error) {
      return null;
    }
  }

  async findByTaskId(taskId: string): Promise<Image[]> {
    try {
      const docs = await ImageModel.find({ taskId }).lean();

      return docs.map((doc) => ImageMapper.toDomain(doc));
    } catch (error) {
      throw new Error(`Failed to find images by taskId: ${(error as Error).message}`);
    }
  }

  async deleteByTaskId(taskId: string): Promise<number> {
    try {
      const result = await ImageModel.deleteMany({ taskId });

      return result.deletedCount || 0;
    } catch (error) {
      throw new Error(`Failed to delete images: ${(error as Error).message}`);
    }
  }
};
