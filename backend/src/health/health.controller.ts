import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      ok: true,
      service: 'nugabox-support-api',
      timestamp: new Date().toISOString(),
    };
  }
}
