import COS from 'cos-js-sdk-v5';
import { getStsTokenApi } from '@/api/upload';
import type { UploadResult } from '@/api/upload/types';

const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'json',
  'csv',
  'xls',
  'xlsx',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

function validateFile(file: File) {
  const ext = getFileExtension(file.name);
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    throw new Error(`不支持的文件类型，允许: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }
}

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  validateFile(file);

  const { data } = await getStsTokenApi(file.name);
  const { Credentials, bucket, region, cosKey } = data;

  const cos = new COS({
    getAuthorization(_options, callback) {
      callback({
        TmpSecretId: Credentials.TmpSecretId,
        TmpSecretKey: Credentials.TmpSecretKey,
        SecurityToken: Credentials.Token,
        StartTime: Math.floor(Date.now() / 1000),
        ExpiredTime: data.ExpiredTime,
      });
    },
  });

  return new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: bucket,
        Region: region,
        Key: cosKey,
        Body: file,
        onProgress: (progressData) => {
          onProgress?.(Math.round(progressData.percent * 100));
        },
      },
      (err, result) => {
        if (err) {
          reject(new Error(err.message || '上传失败'));
          return;
        }
        console.log(result, 'result');
        resolve({
          url: `${import.meta.env.VITE_CND_URL}/${cosKey}`,
          cosKey,
        });
      }
    );
  });
}
