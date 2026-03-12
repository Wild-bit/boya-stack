export interface StsCredentials {
  Credentials: {
    TmpSecretId: string;
    TmpSecretKey: string;
    Token: string;
  };
  ExpiredTime: number;
  RequestId: string;
  bucket: string;
  region: string;
  cosKey: string;
}

export interface UploadResult {
  url: string;
  cosKey: string;
}
