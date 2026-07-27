import { randomUUID } from 'node:crypto';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PublicError } from './http';

const MAX_BYTES = 4 * 1024 * 1024;
const mimeByExtension: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

type StorageProvider = 'aws-s3' | 'cloudflare-r2';

function extension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function signatureMatches(bytes: Uint8Array, ext: string): boolean {
  if (ext === 'pdf') return new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
  if (ext === 'doc') return [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((value, index) => bytes[index] === value);
  if (ext === 'docx') {
    if (!(bytes[0] === 0x50 && bytes[1] === 0x4b)) return false;
    const tail = new TextDecoder('latin1').decode(bytes.slice(Math.max(0, bytes.length - 128_000)));
    return tail.includes('[Content_Types].xml') && tail.includes('word/');
  }
  return false;
}

function selectedProvider(): StorageProvider {
  const value = process.env.RESUME_STORAGE_PROVIDER?.trim();
  if (value !== 'aws-s3' && value !== 'cloudflare-r2') {
    throw new PublicError('Secure résumé storage is not configured.', 503);
  }
  return value;
}

function storageConfig() {
  const provider = selectedProvider();
  const bucket = process.env.RESUME_STORAGE_BUCKET?.trim();
  const accessKeyId = process.env.RESUME_STORAGE_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.RESUME_STORAGE_SECRET_ACCESS_KEY?.trim();
  const endpoint = process.env.RESUME_STORAGE_ENDPOINT?.trim();
  const region = process.env.RESUME_STORAGE_REGION?.trim();

  if (!bucket || !accessKeyId || !secretAccessKey) throw new PublicError('Secure résumé storage is not configured.', 503);
  if (provider === 'aws-s3' && !region) throw new PublicError('The AWS résumé-storage region is not configured.', 503);
  if (provider === 'cloudflare-r2' && !endpoint) throw new PublicError('The Cloudflare R2 endpoint is not configured.', 503);

  return {
    provider,
    bucket,
    endpoint: provider === 'cloudflare-r2' ? endpoint : undefined,
    region: provider === 'cloudflare-r2' ? 'auto' : region,
    credentials: { accessKeyId, secretAccessKey }
  };
}

function client(): { s3: S3Client; bucket: string; provider: StorageProvider } {
  const config = storageConfig();
  return {
    provider: config.provider,
    bucket: config.bucket,
    s3: new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: false,
      credentials: config.credentials
    })
  };
}

export interface StoredResume {
  key: string;
  signedUrl: string;
  originalName: string;
  expiresInSeconds: number;
}

export async function validateResumeFile(file: File): Promise<{ bytes: Uint8Array; ext: string; contentType: string }> {
  if (!file || file.size === 0) throw new PublicError('A résumé file is required.', 400, { resume: 'Select a résumé file.' });
  if (file.size > MAX_BYTES) throw new PublicError('The résumé must be 4 MB or smaller.', 400, { resume: 'The résumé must be 4 MB or smaller.' });

  const ext = extension(file.name);
  const contentType = mimeByExtension[ext];
  if (!contentType) throw new PublicError('Upload a PDF, DOC, or DOCX résumé.', 400, { resume: 'Upload a PDF, DOC, or DOCX résumé.' });
  if (file.type && file.type !== contentType) {
    throw new PublicError('The résumé file type does not match its extension.', 400, { resume: 'The résumé file type does not match its extension.' });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!signatureMatches(bytes, ext)) {
    throw new PublicError('The résumé file contents do not match the selected file type.', 400, { resume: 'The résumé file contents do not match the selected file type.' });
  }
  return { bytes, ext, contentType };
}

export async function storeResume(file: File): Promise<StoredResume> {
  const { bytes, ext, contentType } = await validateResumeFile(file);
  const { s3, bucket, provider } = client();
  const key = `recruitment-resumes/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${ext}`;
  const retentionDays = Math.min(365, Math.max(1, Number(process.env.RESUME_RETENTION_DAYS || 30)));
  const deleteAfter = new Date(Date.now() + retentionDays * 86_400_000).toISOString();

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: bytes,
    ContentType: contentType,
    ContentDisposition: `attachment; filename="resume.${ext}"`,
    ServerSideEncryption: provider === 'aws-s3' ? 'AES256' : undefined,
    Metadata: {
      originalfilename: encodeURIComponent(file.name).slice(0, 500),
      deleteafter: deleteAfter
    }
  }));

  const requestedExpiry = Number(process.env.RESUME_SIGNED_URL_EXPIRATION_SECONDS || 86_400);
  const expiresInSeconds = Math.min(86_400, Math.max(300, Number.isFinite(requestedExpiry) ? requestedExpiry : 86_400));
  const signedUrl = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: expiresInSeconds });
  return { key, signedUrl, originalName: file.name, expiresInSeconds };
}

export async function deleteResume(key: string): Promise<void> {
  if (!key) return;
  const { s3, bucket } = client();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
