import { registerAs } from '@nestjs/config';

export default registerAs('minio', () => ({
  endPoint: process.env.S3_ENDPOINT?.replace(/^https?:\/\//, '').replace(/:\d+$/, '') || 'localhost',
  port: parseInt(process.env.S3_PORT || '9000', 10),
  useSSL: process.env.S3_USE_SSL === 'true',
  accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.S3_SECRET_KEY || 'minioadmin',
  bucket: process.env.S3_BUCKET || 'pho-concept',
  region: process.env.S3_REGION || 'us-east-1',
  publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || null,
  presignedUrlExpiry: parseInt(process.env.S3_PRESIGNED_URL_EXPIRY || '3600', 10),
}));
