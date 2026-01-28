import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from '../user/user.service';
import { ApplicationService } from '../application/application.service';
import { OrdersService } from '../orders/orders.service';
import { ServicesService } from '../services/services.service';
import {
  Address,
  BaseService,
  BonusOperation,
  BonusOperationType,
  Order,
  ServiceOption,
  ServiceVariant,
} from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { OrderDTO } from '../_dto/orders.dto';
import { ChatService } from '../chat/chat.service';
import { Telegraf } from 'telegraf';
import { Request } from 'express';
import axios from 'axios';

@Controller('/api/admin')
export class AdminController {
  constructor(
    private readonly bot: Telegraf,
    private readonly serviceService: ServicesService,
    private readonly orderService: OrdersService,
    private readonly userService: UserService,
    private readonly applicationService: ApplicationService,
    private readonly chatService: ChatService,
  ) {}

  @Get('variants')
  @UseGuards(AuthGuard('jwt'))
  async getVariants() {
    return this.serviceService.getVariants();
  }

  @Get('services')
  @UseGuards(AuthGuard('jwt'))
  async getServices() {
    return this.serviceService.getAll(true);
  }

  @Get('services/:id')
  @UseGuards(AuthGuard('jwt'))
  async getServiceById(@Param('id') id: number) {
    return this.serviceService.getById(id);
  }

  @Delete('services/:id')
  softDeleteService(@Param('id') id: number): any {
    return this.serviceService.delete(Number(id));
  }

  @Post('services/:id')
  restoreService(@Param('id') id: number): any {
    return this.serviceService.restore(Number(id));
  }

  @Post('services')
  @UseGuards(AuthGuard('jwt'))
  async addService(
    @Body()
    service: BaseService & { options: ServiceOption[]; variants: any[] },
  ) {
    return this.serviceService.create(service);
  }

  @Put('services/:id')
  @UseGuards(AuthGuard('jwt'))
  async editService(
    @Body()
    service: BaseService & {
      options: any[];
      variants: any[];
    },
  ) {
    return this.serviceService.update(service);
  }

  @Get('orders')
  @UseGuards(AuthGuard('jwt'))
  async getOrders() {
    return this.orderService.getOrders();
  }

  @Get('orders/:id')
  getOrderById(@Param('id') id: number) {
    return this.orderService
      .getAdminById(Number(id))
      .then((o) => plainToInstance(OrderDTO, o));
  }

  @Put('orders/:id')
  editOrder(@Param('id') id: number, @Body() body: Order): any {
    return this.orderService.updateAdmin(body);
  }

  @Patch('orders/:id')
  async patchOrder(@Param('id') id: number, @Body() body: Order) {
    const item = await this.orderService.getAdminById(Number(id));

    Object.assign(item, body);

    return this.orderService.updateAdmin(item);
  }

  @Post('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string) {
    return this.orderService.cancelAdmin(id);
  }

  @Post('orders/:id')
  restoreOrder(@Param('id') id: number): any {
    return this.orderService.restore(Number(id));
  }

  @Get('users')
  @UseGuards(AuthGuard('jwt'))
  async getUsers() {
    return this.userService.getUsers();
  }

  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Get('users/:id/orders')
  @UseGuards(AuthGuard('jwt'))
  async getOrdersByUserId(@Param('id') id: string) {
    return this.orderService.getOrdersByUserId(id);
  }

  @Get('users/:id/bonuses')
  @UseGuards(AuthGuard('jwt'))
  async getBonusOperationsByUserId(@Param('id') id: string) {
    return this.userService.getBonusOperations(id);
  }

  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
  }

  @Post('users/:id/bonuses')
  @UseGuards(AuthGuard('jwt'))
  async addBonus(@Param('id') id: string, @Body() bonus: BonusOperation) {
    bonus.type = BonusOperationType.GIFT;
    bonus.userId = id;
    return this.userService.addBonus(bonus);
  }

  @Get('applications')
  @UseGuards(AuthGuard('jwt'))
  async getApplications() {
    return this.applicationService.getApplications();
  }

  @Get('applications/:id')
  @UseGuards(AuthGuard('jwt'))
  async getApplicationByUserId(@Param('id') userId: string) {
    const application = await this.applicationService.getApplication(userId);
    if (!application) {
      throw new NotFoundException({ message: 'Application not found' });
    }
    return application;
  }

  @Post('applications/:id/approve')
  @UseGuards(AuthGuard('jwt'))
  async approveApplication(@Param('id') id: number) {
    return this.applicationService.approveApplication(id);
  }

  @Post('applications/:id/reject')
  @UseGuards(AuthGuard('jwt'))
  async rejectApplication(@Param('id') id: number) {
    return this.applicationService.rejectApplication(id);
  }

  @Get('chat')
  async getDialogs() {
    return this.chatService.getChats();
  }

  @Get('chat/:id')
  async getDialogById(@Param('id') id: string) {
    return this.chatService.getChatById(id);
  }

  @Post('chat/:id/start')
  @UseGuards(AuthGuard('jwt'))
  async startChat(@Param('id') id: string, @Req() req) {
    return this.chatService.startChat(id, req.user.id);
  }

  @Post('chat/:id/close')
  @UseGuards(AuthGuard('jwt'))
  async closeChat(@Param('id') id: string, @Req() req) {
    // The operator left the chat
    return this.chatService.closeChat(id, req.user.id);
  }

  // Нужно для локального фронта
  @Get('chat-assets/photos/:path')
  async getPublic(
    @Param('path') path: string,
    @Req() req: Request,
    @Res() res,
  ) {
    return this.proxyRequest(`photos/${path}`, req, res);
  }

  private buildProxyUrl(path: string, req: Request) {
    const baseUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/`;
    const query = new URLSearchParams(
      req.query as Record<string, string>,
    ).toString();
    return `${baseUrl}${path}${query ? `?${query}` : ''}`;
  }

  private async proxyRequest(path: string, req: Request, res) {
    try {
      const url = this.buildProxyUrl(path, req);
      const response = await axios.get(url, { responseType: 'stream' });

      res.set({
        'content-type': response.headers['content-type'],
        'cache-control': response.headers['cache-control'],
      });

      response.data.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).send('Proxy error');
    }
  }
}
