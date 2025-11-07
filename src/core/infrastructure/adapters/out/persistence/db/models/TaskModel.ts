import mongoose, { Schema, Document } from 'mongoose';
import { IProcessedImage } from './image.model';

export interface ITask extends Document {
  status: string;
  price: number;
  originalPath: string;
  images: IProcessedImage[];
  error: string;
  createdAt: Date;
  updatedAt: Date;
};

const TaskSchema = new Schema<ITask>(
  {
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true, index: true },
    price: { type: Number, required: true },
    originalPath: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => {
          if (/^https?:\/\//i.test(v)) { return true; } // URL
          if (/^\//.test(v) || /^\.\.?\//.test(v)) { return true; } // Unix path
          if (/^[a-zA-Z]:[\\\/]/.test(v) || /^\.\.?[\\\/]/.test(v) || /^\\\\/.test(v)) { return true; } // Windows path

          return false;
        },
        message: 'Invalid URL or path format'
      }
    },
    images: [
      {
        resolution: { type: String, required: true },
        path: { type: String, required: true }
      }
    ],
    error: { type: String }
  },
  {
    timestamps: true,

    // optimize for lean queries
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
  }
);

TaskSchema.index({ createdAt: -1 });            // query recent tasks
TaskSchema.index({ status: 1, createdAt: -1 }); // query tasks by status, sorted by date
TaskSchema.index({ status: 1, updatedAt: -1 }); // query tasks by status and last update

export const TaskModel = mongoose.model<ITask>('Task', TaskSchema);
