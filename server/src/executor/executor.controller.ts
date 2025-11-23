import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { OrderDTO } from '../_dto/orders.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('/api/executor')
export class ExecutorController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/orders')
  getOrders(@Req() req) {
    return this.ordersService.getAllByExecutor(req.user.id).then((r) =>
      r.map((o) =>
        plainToInstance(OrderDTO, {
          ...o,
          status: o.date > new Date() ? o.status : OrderStatus.completed,
        }),
      ),
    );
  }

  @Get('/orders/:id')
  getByIdFromExecutor(@Param('id') id: number, @Req() req) {
    return this.ordersService
      .getByIdFromExecutor(id, req.user.id)
      .then((r) => plainToInstance(OrderDTO, r));
  }

  @Post('/orders/:id/complete')
  async completeOrder(@Param('id') id: number, @Req() req) {
    const item = await this.ordersService.getByIdFromExecutor(id, req.user.id);

    item.status = OrderStatus.completed;
    item.completedAt = new Date();

    return this.ordersService
      .update(item)
      .then((o) => plainToInstance(OrderDTO, o));
  }

  @Post('/orders/:id/processed')
  async processedOrder(@Param('id') id: number, @Req() req) {
    const item = await this.ordersService.getByIdFromExecutor(id, req.user.id);

    item.status = OrderStatus.processed;
    item.executorId = req.user.id;
    item.startedAt = new Date();

    return this.ordersService
      .update(item)
      .then((o) => plainToInstance(OrderDTO, o));
  }

  @Patch('orders/:id')
  async patchOrder(@Param('id') id: number, @Body() body: Order, @Req() req) {
    const item = await this.ordersService.getByIdFromExecutor(
      Number(id),
      req.user.id,
    );

    Object.assign(item, body);

    return this.ordersService.updateAdmin(item);
  }
}
