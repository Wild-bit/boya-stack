import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { DatabaseConfig } from '../config/env';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService) {
    const dbConfig = configService.get<DatabaseConfig>('database');
    const connectionString = dbConfig?.url || process.env['DATABASE_URL'] || '';

    // 从 URL 中提取 schema 参数
    const url = new URL(connectionString);
    const schema = url.searchParams.get('schema') || 'public';

    const adapter = new PrismaPg({
      connectionString,
      schema,
    });
    super({ adapter });
  }

  async onModuleInit() {
    console.log('DATABASE_URL runtime:', process.env.DATABASE_URL);
    console.log('database config', this.configService.get<DatabaseConfig>('database'));
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
