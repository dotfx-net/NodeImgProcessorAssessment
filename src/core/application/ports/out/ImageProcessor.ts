export interface ProcessedImage {
  buffer: Buffer;
  resolution: string;
  md5: string;
  format: string;
  outputPath: string;
};

export interface ImageBuffer {
  buffer: Buffer;
  name: string;
  mimeType: string;
  ext: string;
};

export interface ImageProcessor {
  loadImageBuffer(source: string): Promise<ImageBuffer>;
  processImage(imageBuffer: ImageBuffer, resolutions: number[]): Promise<ProcessedImage[]>;
  saveImage(processedImage: ProcessedImage): Promise<string>;
};
