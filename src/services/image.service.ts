import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { md5 } from '../utils/hash';
import { config } from '../config/config';
import { ImageModel, IProcessedImage } from '../models/image.model';

interface ImageBuffer {
  buf: Buffer;
  name: string;
  mimeType: string;
  ext: string;
};

const formatMap: Record<string, keyof sharp.FormatEnum> = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/tiff': 'tiff'
};

export async function loadImageBuffer(src: string): Promise<ImageBuffer> {
  const isUrl = /^https?:\/\//i.test(src);

  let buf: Buffer;
  let parsedPath: path.ParsedPath;
  let mimeType: string;

  if (isUrl) {
    const urlPath = new URL(src).pathname;
    const res = await fetch(src);

    if (!res.ok) { throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`); }

    const arrayBuffer = await res.arrayBuffer();

    buf = Buffer.from(arrayBuffer);
    parsedPath = path.parse(urlPath || 'image');
    mimeType = res.headers.get('content-type') || 'image/jpeg';
  } else {
    buf = await fs.promises.readFile(src);
    parsedPath = path.parse(src);

    // detect mime type from buffer
    const metadata = await sharp(buf).metadata();
    mimeType = metadata.format ? `image/${metadata.format}` : 'image/jpeg';
  }

  const name = parsedPath.name || `image_${crypto.randomBytes(8).toString('hex')}`;
  const ext = parsedPath.ext || '.jpg';

  return {
    buf,
    name,
    ext,
    mimeType
  };
}

export async function processAndSave(taskId: string, src: string, sizes: number[]): Promise<IProcessedImage[]> {
  try {
    const { buf, name, mimeType } = await loadImageBuffer(src);

    const format = formatMap[mimeType] || 'jpeg';
    const outputExt = format === 'jpeg' ? '.jpg' : `.${format}`;
    const outputs: IProcessedImage[] = [];

    for (const w of sizes) {
      const resized = await sharp(buf)
        .resize({ width: w, withoutEnlargement: false })
        .toFormat(format)
        .toBuffer();

      const hash = md5(resized);
      const filename = `${hash}${outputExt}`;
      const relPath = path.join(config.processing.output, name, String(w), filename);
      const absPath = path.join(process.cwd(), relPath);

      await fs.promises.mkdir(path.dirname(absPath), { recursive: true }); // ensure directory exists
      await fs.promises.writeFile(absPath, resized);

      const normalizedPath = `/${relPath.replace(/\\/g, '/')}`;

      outputs.push({ resolution: String(w), path: normalizedPath });

      await ImageModel.create({
        taskId,
        name,
        mimeType,
        resolution: String(w),
        md5: hash,
        path: normalizedPath
      });
    }

    return outputs;
  } catch (error: any) {
    throw new Error(`Image processing failed: ${error.message}`);
  }
}
