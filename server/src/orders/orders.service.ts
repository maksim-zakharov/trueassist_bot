import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseService, Order, OrderStatus, User } from '@prisma/client';
import { BusinessException } from '../common/exceptions/business.exception';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private validateOrderDate(date: Date) {
    const now = new Date();
    if (date < now) {
      throw new BusinessException(
        'INVALID_ORDER_DATE',
        'Дата заказа не может быть в прошлом',
      );
    }
  }

  async getOrdersByUserId(userId: Order['userId']) {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          {
            executorId: userId,
          },
          {
            userId,
          },
        ],
      },
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
      },
    });

    return orders;
  }

  async getAdminById(id: Order['id']) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
        executor: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async getById(id: Order['id'], userId: Order['userId']) {
    const order = await this.prisma.order.findUnique({
      where: { id, userId },
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
        executor: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async getByIdFromExecutor(id: Order['id'], executorId: Order['executorId']) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
        OR: [
          {
            executorId,
          },
          { status: 'todo' },
        ],
      },
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
        executor: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    order.status =
      order.date > new Date() ? order.status : OrderStatus.completed;

    return order;
  }

  getOrders() {
    return this.prisma.order.findMany({
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
        executor: true,
      },
    });
  }

  getAll(userId: Order['userId']) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
      },
    });
  }

  getAllByExecutor(executorId: Order['executorId']) {
    return this.prisma.order.findMany({
      where: {
        OR: [
          {
            executorId,
          },
          { status: 'todo' },
        ],
      },
      include: {
        baseService: true,
        options: true,
        serviceVariant: true,
      },
    });
  }

  async create(data: CreateOrderDto & { userId: User['id'] }): Promise<Order> {
    // Проверка что дата заказа позже текущего времени
    this.validateOrderDate(data.date);
    try {
      return this.prisma.$transaction(async (tx) => {
        if (data.bonus) {
          const operations = await tx.bonusOperation.findMany({
            where: {
              userId: data.userId,
            },
          });

          const total = operations.reduce((acc, curr) => acc + curr.value, 0);
          if (data.bonus > total) {
            throw new BadRequestException({ message: 'Not enough bonuses' });
          }
        }

        const order = await tx.order.create({
          data: {
            baseServiceId: data.baseService.id,
            userId: data.userId,
            date: new Date(data.date),
            fullAddress: data.fullAddress,
            serviceVariantId: data.serviceVariant.id,
            bonus: data.bonus,
            comment: data.comment,
            options: {
              connect: data.options?.map(({ id }) => ({ id })) || [],
            },
          },
          include: {
            options: true,
            baseService: true,
            serviceVariant: true,
          },
        });

        await tx.bonusOperation.create({
          data: {
            userId: data.userId,
            type: 'ORDER',
            value: -data.bonus,
            description: `Order №${order.id}`,
          },
        });

        return order;
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create order');
    }
  }

  async restore(id: Order['id']) {
    return this.prisma.order.update({
      data: {
        status: OrderStatus.todo,
      },
      where: { id },
    });
  }

  async cancelAdmin(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!order) throw new NotFoundException('Order not found');

      order.status = OrderStatus.canceled;

      const canceled = await this.prisma.order.update({
        where: { id: Number(id) },
        data: order,
        include: {
          options: true, // Чтобы получить связанные опции в ответе
        },
      });

      if (order.bonus) {
        await tx.bonusOperation.create({
          data: {
            userId: order.userId,
            type: 'ORDER',
            value: order.bonus,
          },
        });
      }

      return canceled;
    });
  }

  async cancel(userId: Order['userId'], id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          userId,
          id: Number(id),
        },
      });

      if (!order) throw new NotFoundException('Order not found');

      order.status = OrderStatus.canceled;

      const canceled = await this.prisma.order.update({
        where: { userId, id: Number(id) },
        data: order,
        include: {
          options: true, // Чтобы получить связанные опции в ответе
        },
      });

      if (order.bonus) {
        await tx.bonusOperation.create({
          data: {
            userId: userId,
            type: 'ORDER',
            value: order.bonus,
          },
        });
      }

      return canceled;
    });
  }

  async cancelByExecutor(executorId: Order['executorId'], id: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id: Number(id),
          executorId,
        },
      });

      if (!order) throw new NotFoundException('Order not found');

      // Исполнитель может отказаться только от текущего назначенного заказа
      if (order.status !== OrderStatus.processed) {
        throw new BadRequestException({
          message: 'Order cannot be rejected in current status',
        });
      }

      order.status = OrderStatus.todo;
      order.executorId = null;
      order.startedAt = null;

      const updated = await tx.order.update({
        where: { id: Number(id) },
        data: order,
        include: {
          options: true,
        },
      });

      return updated;
    });
  }

  async updateAdmin(data: any): Promise<Order> {
    // Проверка что дата заказа позже текущего времени
    // this.validateOrderDate(data.date);
    try {
      return this.prisma.order.update({
        where: { id: data.id },
        data: {
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          baseServiceId: data.baseService.id,
          executorId: data.executorId,
          status: data.status,
          userId: data.userId,
          date: new Date(data.date),
          fullAddress: data.fullAddress,
          serviceVariantId: data.serviceVariant.id,
          comment: data.comment,
          managerComment: data.managerComment,
          options: {
            set: data.options.map(({ id }) => ({ id })),
          },
        },
        include: {
          options: true, // Чтобы получить связанные опции в ответе
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async update(data: any): Promise<Order> {
    // Проверка что дата заказа позже текущего времени
    this.validateOrderDate(data.date);
    try {
      return this.prisma.order.update({
        where: { id: data.id, userId: data.userId },
        data: {
          startedAt: data.startedAt,
          completedAt: data.completedAt,
          baseServiceId: data.baseService.id,
          executorId: data.executorId,
          status: data.status,
          userId: data.userId,
          date: new Date(data.date),
          fullAddress: data.fullAddress,
          serviceVariantId: data.serviceVariant.id,
          comment: data.comment,
          options: {
            set: data.options.map(({ id }) => ({ id })),
          },
        },
        include: {
          options: true, // Чтобы получить связанные опции в ответе
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async delete(id: Order['id']): Promise<Order> {
    try {
      return this.prisma.order.delete({
        where: { id },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete order');
    }
  }
}
