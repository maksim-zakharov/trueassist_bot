import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { Order, OrderStatus } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { OrderDTO } from '../_dto/orders.dto';
import { UserService } from '../user/user.service';

@UseGuards(AuthGuard('jwt'))
@Controller('/api/executor')
export class ExecutorController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly userService: UserService,
  ) {}

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
  async getByIdFromExecutor(@Param('id') id: number, @Req() req) {
    const order = await this.ordersService.getByIdFromExecutor(id, req.user.id);

    let user;
    if (order?.executorId === req.user.id) {
      user = await this.userService.getById(order.userId);
    }

    return plainToInstance(OrderDTO, { ...order, user });
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

  @Post('/orders/:id/reject')
  async rejectOrder(@Param('id') id: number, @Req() req) {
    const item = await this.ordersService.getByIdFromExecutor(id, req.user.id);

    // Только если заказ уже принят текущим исполнителем
    if (item.executorId !== req.user.id || item.status !== OrderStatus.processed) {
      throw new BadRequestException({
        message: 'Order cannot be rejected in current status',
      });
    }

    const updated = await this.ordersService.cancelByExecutor(req.user.id, String(id));

    return plainToInstance(OrderDTO, updated);
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
