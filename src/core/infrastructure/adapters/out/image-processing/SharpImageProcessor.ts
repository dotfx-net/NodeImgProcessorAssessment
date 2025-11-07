import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ImageProcessor, ProcessedImage, ImageBuffer } from '@/core/application/ports/out/ImageProcessor';
import { md5 } from '@/shared/utils/hash';

const formatMap: Record<string, keyof sharp.FormatEnum> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/tiff': 'tiff'
};

export class SharpImageProcessor implements ImageProcessor {
  private readonly outputDir: string;

  constructor(outputDir: string = 'output') {
    this.outputDir = outputDir;
  }

  async loadImageBuffer(src: string): Promise<ImageBuffer> {
    const isUrl = /^https?:\/\//i.test(src);

    let buffer: Buffer;
    let parsedPath: path.ParsedPath;
    let mimeType: string;

    try {
      if (isUrl) {
        const res = await fetch(src);

        if (!res.ok) { throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`); }

        const arrayBuffer = await res.arrayBuffer();
        const urlPath = new URL(src).pathname;

        buffer = Buffer.from(arrayBuffer);
        parsedPath = path.parse(urlPath || 'image');
        mimeType = res.headers.get('content-type') || 'image/jpeg';
      } else {
        buffer = await fs.promises.readFile(src);
        parsedPath = path.parse(src);

        // detect mime type from buffer
        const metadata = await sharp(buffer).metadata();
        mimeType = metadata.format ? `image/${metadata.format}` : 'image/jpeg';
      }

      const name = parsedPath.name || `image_${crypto.randomBytes(8).toString('hex')}`;
      const ext = parsedPath.ext || '.jpg';

      return {
        buffer,
        name,
        ext,
        mimeType
      };
    } catch (error: any) {
      throw new Error(`Failed to load image from source '${src}': ${error.message}`);
    }
  }

  async processImage(imageBuffer: ImageBuffer, sizes: number[]): Promise<ProcessedImage[]> {
    try {
      const format = formatMap[imageBuffer.mimeType] || 'jpeg';
      const outputExt = format === 'jpeg' ? '.jpg' : `.${format}`;
      const outputs: ProcessedImage[] = [];

      for (const w of sizes) {
        const resized = await sharp(imageBuffer.buffer).resize({ width: w, withoutEnlargement: false }).toFormat(format as keyof sharp.FormatEnum).toBuffer();
        const hash = md5(resized);
        const filename = `${hash}${outputExt}`;
        const outputPath = path.join(this.outputDir, imageBuffer.name, String(w), filename);

        outputs.push({
          buffer: resized,
          resolution: String(w),
          md5: hash,
          format,
          outputPath
        });
      }

      return outputs;
    } catch (error: any) {
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  async saveImage(processedImage: ProcessedImage): Promise<string> {
    try {
      const absPath = path.join(process.cwd(), processedImage.outputPath);

      await fs.promises.mkdir(path.dirname(absPath), { recursive: true });
      await fs.promises.writeFile(absPath, processedImage.buffer);

      const normalizedPath = `/${processedImage.outputPath.replace(/\\/g, '/')}`;

      return normalizedPath;
    } catch (error: any) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }
};
