import { Image } from '@/core/domain/entities/Image';

export class ImageMapper {
  // convert Mongoose document to Domain entity
  static toDomain(doc: any): Image {
    return new Image(
      String(doc._id),
      String(doc.taskId),
      doc.name,
      doc.mimeType,
      doc.resolution,
      doc.md5,
      doc.path,
      new Date(doc.createdAt)
    );
  }

  // convert Domain entity to Mongoose document (plain object)
  static toMongoose(image: Image): any {
    const doc: any = {
      taskId: image.taskId,
      name: image.name,
      mimeType: image.mimeType,
      resolution: image.resolution,
      md5: image.md5,
      path: image.path,
      createdAt: image.createdAt
    };

    if (image.id !== '') { doc._id = image.id; }

    return doc;
  }
};
