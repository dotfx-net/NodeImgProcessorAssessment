import mongoose, { Schema, Document } from 'mongoose';

export type TaskStatus = 'pending' | 'completed' | 'failed';

export interface ITask extends Document {
  status: TaskStatus;
  price: number;
  originalPath: string;
  images: Array<{ resolution: string; path: string }>;
  error: string;
  createdAt: Date;
  updatedAt: Date;
};

const TaskSchema = new Schema<ITask>(
  {
    status: { type: String, enum: ['pending', 'completed', 'failed'], required: true, index: true },
    price: { type: Number, required: true },
    originalPath: { type: String, required: true },
    images: [
      {
        resolution: { type: String, required: true },
        path: { type: String, required: true }
      }
    ],
    error: { type: String }
  },
  { timestamps: true }
);

TaskSchema.index({ createdAt: -1 });

export const TaskModel = mongoose.model<ITask>('Task', TaskSchema);
