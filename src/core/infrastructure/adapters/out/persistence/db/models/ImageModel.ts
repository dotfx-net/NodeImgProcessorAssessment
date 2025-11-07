import mongoose, { Schema, Document } from 'mongoose';

export interface IProcessedImage {
  resolution: string;
  path: string;
}

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
    resolution: { type: String, index: true, required: true },
    md5: { type: String, index: true, required: true },
    path: { type: String, required: true, unique: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },

    // optimize for lean queries
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
  }
);

ImageSchema.index({ taskId: 1, createdAt: -1 }); // get images by task, sorted by date
ImageSchema.index({ taskId: 1, resolution: 1 }); // get images by task and resolution
ImageSchema.index({ md5: 1, resolution: 1 });    // check for duplicate images at same resolution

export const ImageModel = mongoose.model<IImage>('Image', ImageSchema);
