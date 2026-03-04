import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { PublicRoute } from '@/common/decorators/publicRoute.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @PublicRoute()
  @Get()
  check() {
    return this.healthService.check();
  }
}
