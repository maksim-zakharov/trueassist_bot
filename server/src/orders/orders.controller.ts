import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { Order, OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { OrderDTO } from '../_dto/orders.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('/api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('')
  getOrders(@Req() req) {
    return this.ordersService
      .getAll(req.user.id)
      .then((r) => r.map((o) => plainToInstance(OrderDTO, o)));
  }

  @Get('/:id')
  getOrderById(@Param('id') id: number, @Req() req) {
    return this.ordersService
      .getById(Number(id), req.user.id)
      .then((o) => plainToInstance(OrderDTO, o));
  }

  @Put('/:id')
  editOrder(@Param('id') id: number, @Body() body: Order, @Req() req): any {
    return this.ordersService.update({ ...body, userId: req.user.id });
  }

  @Patch('/:id')
  async patchOrder(@Param('id') id: number, @Body() body: Order, @Req() req) {
    const item = await this.ordersService.getById(Number(id), req.user.id);

    Object.assign(item, body);

    return this.ordersService.update(item);
  }

  @Post('/:id/cancel')
  async cancelOrder(@Param('id') id: string, @Body() body: Order, @Req() req) {
    return this.ordersService.cancel(req.user.id, id);
  }

  @Post('')
  addOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.ordersService.create({
      ...createOrderDto,
      userId: req.user.id,
    });
  }
}
