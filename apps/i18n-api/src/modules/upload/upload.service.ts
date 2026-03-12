import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import * as StsClient from 'tencentcloud-sdk-nodejs-sts';

@Injectable()
export class UploadService {
  private readonly secretId: string;
  private readonly secretKey: string;
  private readonly stsClient: typeof StsClient.sts.v20180813.Client;
  constructor(private readonly configService: ConfigService) {
    this.stsClient = StsClient.sts.v20180813.Client;
    this.secretId = this.configService.get<string>('TENCENT_CLOUD_SECRET_ID') || '';
    this.secretKey = this.configService.get<string>('TENCENT_CLOUD_SECRET_KEY') || '';
  }

  /*
   * @description 生成要上传的 COS 文件路径文件名
   * @param extension 文件扩展名
   * @returns 文件名
   */
  generateCosKey(fileName: string) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) {
      throw new BadRequestException('fileName 必须包含文件扩展名');
    }
    return `boya/upload/${dayjs().valueOf()}-${nanoid(8)}.${extension}`;
  }

  async generateUploadStsAccessToken() {
    const policy = {
      version: '2.0',
      statement: [
        {
          effect: 'allow',
          action: ['name/cos:PutObject', 'name/cos:GetObject', 'name/cos:HeadObject'],
          resource: [`qcs::cos:ap-guangzhou:uid/1328693273:lance-bucket-1328693273/boya/*`],
        },
      ],
    };
    const policyString = encodeURIComponent(JSON.stringify(policy));
    const client = new this.stsClient({
      credential: {
        secretId: this.secretId,
        secretKey: this.secretKey,
      },
      region: 'ap-guangzhou',
      profile: {
        httpProfile: {
          endpoint: 'sts.tencentcloudapi.com',
        },
      },
    });
    const res = await client.GetFederationToken({
      Name: 'i18n-upload-sts',
      Policy: policyString,
    });
    return {
      ...res,
      bucket: 'lance-bucket-1328693273',
      region: 'ap-guangzhou',
    };
  }
}
