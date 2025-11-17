import { Controller, Get } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Controller()
export class AppController {
  @Get('/api/healthcheck')
  async healthCheck() {
    return {
      serverTime: new Date().toISOString(),
      serverTimeDayjs: dayjs().toISOString(),
      env: process.env.NODE_ENV,
    };
  }
}
