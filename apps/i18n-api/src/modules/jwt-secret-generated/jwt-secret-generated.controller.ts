import { Controller, Get } from '@nestjs/common';
import { JwtSecretGeneratedService } from './jwt-secret-generated.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PublicRoute } from '@/common/decorators/publicRoute.decorator';

@ApiTags('JWT 密钥生成')
@Controller('jwt-secret-generated')
export class JwtSecretGeneratedController {
  constructor(private readonly jwtSecretGeneratedService: JwtSecretGeneratedService) {}

  @PublicRoute()
  @Get()
  @ApiOperation({ summary: '生成 JWT 密钥' })
  generateJwtSecret() {
    return this.jwtSecretGeneratedService.generateJwtSecret();
  }
}
