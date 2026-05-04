import { Injectable, Logger, OnModuleInit, ServiceUnavailableException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import type { Readable } from 'stream';
import { IStoragePort, UploadResult } from '@application/cms/ports/storage.port';

@Injectable()
export class MinioService extends IStoragePort implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucket: string;
  private internalBaseUrl: string;
  private publicBaseUrl: string | null;
  private isReady = false;

  constructor(private readonly config: ConfigService) {
    super();

    const endPoint = this.config.get<string>('minio.endPoint', 'localhost');
    const port = this.config.get<number>('minio.port', 9000);
    const useSSL = this.config.get<boolean>('minio.useSSL', false);
    const accessKey = this.config.get<string>('minio.accessKey', 'minioadmin');
    const secretKey = this.config.get<string>('minio.secretKey', 'minioadmin');

    this.bucket = this.config.get<string>('minio.bucket', 'pho-concept');
    this.publicBaseUrl = this.config.get<string>('minio.publicEndpoint') || null;

    const protocol = useSSL ? 'https' : 'http';
    this.internalBaseUrl = `${protocol}://${endPoint}:${port}`;

    this.client = new Minio.Client({ endPoint, port, useSSL, accessKey, secretKey });

    this.logger.log(`MinIO initialized: ${endPoint}:${port} | bucket: ${this.bucket}`);
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket created: ${this.bucket}`);
      }
      await this.setPublicReadPolicy();
      this.isReady = true;
      this.logger.log(`MinIO bucket ready: ${this.bucket}`);
    } catch (err) {
      this.logger.warn(`MinIO not available at startup: ${(err as Error).message}`);
    }
  }

  private async setPublicReadPolicy(): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        },
      ],
    };
    try {
      await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
    } catch (err) {
      this.logger.warn(`Failed to set bucket policy: ${(err as Error).message}`);
    }
  }

  async uploadFile(
    key: string,
    stream: Buffer | Readable,
    size: number,
    contentType: string,
  ): Promise<UploadResult> {
    if (!this.isReady) {
      throw new ServiceUnavailableException('Storage service is not available. Please try again later.');
    }
    try {
      await this.client.putObject(this.bucket, key, stream, size, { 'Content-Type': contentType });
    } catch (err) {
      this.logger.error(`MinIO upload failed: ${(err as Error).message}`, { key });
      throw new InternalServerErrorException('Failed to upload file to storage.');
    }
    const url = this.getPublicUrl(key);
    this.logger.log(`Uploaded: ${key}`);
    return { key, bucket: this.bucket, url, size, contentType };
  }

  async deleteFile(key: string): Promise<void> {
    try {
      await this.client.removeObject(this.bucket, key);
    } catch (err) {
      this.logger.warn(`MinIO delete failed for key ${key}: ${(err as Error).message}`);
      return;
    }
    this.logger.log(`Deleted: ${key}`);
  }

  getPublicUrl(key: string): string {
    const base = this.publicBaseUrl || this.internalBaseUrl;
    return `${base}/${this.bucket}/${key}`;
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucket, key);
      return true;
    } catch {
      return false;
    }
  }
}
