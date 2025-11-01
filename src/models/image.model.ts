import mongoose, { Schema, Document } from 'mongoose';

export interface IImage extends Document {
  taskId: mongoose.Types.ObjectId;
  name: string;
  mimeType: string;
  resolution: string;
  md5: string;
  path: string;
  createdAt: Date;
};

const ImageSchema = new Schema<IImage>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: 'Task', index: true, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    resolution: { type: String, required: true },
    md5: { type: String, required: true },
    path: { type: String, required: true, unique: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

ImageSchema.index({ taskId: 1, createdAt: -1 });

export const ImageModel = mongoose.model<IImage>('Image', ImageSchema);
