import type { Readable } from 'stream';

export interface UploadResult {
  key: string;
  bucket: string;
  url: string;
  size: number;
  contentType: string;
}

export abstract class IStoragePort {
  abstract uploadFile(
    key: string,
    stream: Buffer | Readable,
    size: number,
    contentType: string,
  ): Promise<UploadResult>;

  abstract deleteFile(key: string): Promise<void>;

  abstract getPublicUrl(key: string): string;

  abstract fileExists(key: string): Promise<boolean>;
}
