export class Image {
  constructor(
    public readonly id: string,
    public readonly taskId: string,
    public readonly name: string,
    public readonly mimeType: string,
    public readonly resolution: string,
    public readonly md5: string,
    public readonly path: string,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(
    taskId: string,
    name: string,
    mimeType: string,
    resolution: string,
    md5: string,
    path: string
  ): Image {
    return new Image('', taskId, name, mimeType, resolution, md5, path, new Date());
  }
};
