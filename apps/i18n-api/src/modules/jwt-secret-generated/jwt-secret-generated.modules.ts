import { Module } from '@nestjs/common';
import { JwtSecretGeneratedController } from './jwt-secret-generated.controller';
import { JwtSecretGeneratedService } from './jwt-secret-generated.service';

@Module({
  controllers: [JwtSecretGeneratedController],
  providers: [JwtSecretGeneratedService],
})
export class JwtSecretGeneratedModule {}
