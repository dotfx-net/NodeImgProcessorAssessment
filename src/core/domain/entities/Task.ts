export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
};

export interface TaskImage {
  resolution: string;
  path: string;
};

export class Task {
  constructor(
    public readonly id: string,
    public readonly status: TaskStatus,
    public readonly price: number,
    public readonly originalPath: string,
    public readonly images: TaskImage[],
    public readonly error?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(originalPath: string, price: number): Task {
    return new Task(
      '',
      TaskStatus.PENDING,
      price,
      originalPath,
      [],
      undefined,
      new Date(),
      new Date()
    );
  }

  markAsCompleted(images: TaskImage[]): Task {
    return new Task(
      this.id,
      TaskStatus.COMPLETED,
      this.price,
      this.originalPath,
      images,
      undefined,
      this.createdAt,
      new Date()
    );
  }

  markAsFailed(error: string): Task {
    return new Task(
      this.id,
      TaskStatus.FAILED,
      this.price,
      this.originalPath,
      [],
      error,
      this.createdAt,
      new Date()
    );
  }

  isPending(): boolean { return this.status === TaskStatus.PENDING; }
  isCompleted(): boolean { return this.status === TaskStatus.COMPLETED; }
  isFailed(): boolean { return this.status === TaskStatus.FAILED; }
};
