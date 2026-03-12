import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @ApiOperation({ summary: '生成 STS 上传凭证' })
  @Get('sts')
  async getStsToken(@Query('fileName') fileName: string) {
    if (!fileName || !fileName.includes('.')) {
      throw new BadRequestException('fileName 必须包含文件扩展名');
    }
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'json', 'csv', 'xls', 'xlsx'];
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExts.includes(ext)) {
      throw new BadRequestException(`不支持的文件类型，允许: ${allowedExts.join(', ')}`);
    }
    const cosKey = this.uploadService.generateCosKey(fileName);
    const credentials = await this.uploadService.generateUploadStsAccessToken();
    return { ...credentials, cosKey };
  }
}
