import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ServiceVariant } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { ApplicationDto } from '../_dto/application.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('/api/application')
export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}

  @Get('')
  getApplication(@Req() req) {
    return this.service
      .getApplication(req.user.id)
      .then((r) => plainToInstance(ApplicationDto, r));
  }

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  async submitApplication(@Body() body: ServiceVariant['id'][], @Req() req) {
    await this.service.submitApplication(req.user.id, body);
  }
}
