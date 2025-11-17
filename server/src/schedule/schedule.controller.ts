import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScheduleService } from './schedule.service';

@UseGuards(AuthGuard('jwt'))
@Controller('/api/schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getSchedule(@Req() req) {
    const schedule = await this.scheduleService.findSchedule(req.user.id);
    if (!schedule) throw new NotFoundException('User schedule not found');
    return schedule;
  }

  @Put()
  async updateSchedule(@Req() req, @Body() updateScheduleDto: any) {
    return this.scheduleService.updateSchedule(req.user.id, updateScheduleDto);
  }

  // TODO Потом Перенести в CRON чтоб не нагружать базу для большого количества пользователей
  @Get('available-slots')
  getAvailableSlots(
    @Query('date') date: string,
    @Query('serviceVariantId') serviceVariantId: string,
    @Query('optionIds') optionIds?: string,
  ) {
    return this.scheduleService.getAvailableSlots(
      date,
      Number(serviceVariantId),
      optionIds ? optionIds.split(',').map(Number) : [],
    );
  }

  @Get('available-dates')
  async getAvailableDates(
    @Query('serviceVariantId') serviceVariantId: number,
    @Query('optionIds') optionIds?: string,
  ) {
    const parsedOptionIds = optionIds ? optionIds.split(',').map(Number) : [];
    return this.scheduleService.getAvailableDates(
      serviceVariantId,
      parsedOptionIds,
    );
  }
}
