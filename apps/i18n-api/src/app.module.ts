import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.modules';
import { TeamsModule } from './modules/teams/teams.modules';
import { JwtSecretGeneratedModule } from './modules/jwt-secret-generated/jwt-secret-generated.modules';
import { appConfig, databaseConfig } from './config/env';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

const nodeEnv = process.env['NODE_ENV'] || 'development';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${nodeEnv}`, '.env'],
      load: [appConfig, databaseConfig],
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    TeamsModule,
    JwtSecretGeneratedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
