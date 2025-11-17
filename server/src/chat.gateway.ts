// src/order-book.gateway.ts
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat/chat.service';
import { Telegraf } from 'telegraf';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  private clients: Map<Socket, { symbols: string[]; minAmount: number }> =
    new Map();

  constructor(
    private readonly bot: Telegraf,
    private readonly chatService: ChatService,
  ) {}

  handleConnection(client: Socket) {
    this.chatService.addClient(client);
    this.logger.log('Client connected');
  }

  handleDisconnect(client: Socket) {
    // this.unsubscribeOrderbookAll(client);
    this.clients.delete(client);
    this.logger.log('Client disconnected');
  }

  @SubscribeMessage('message')
  async handleOrderbookSubscribe(client: Socket, payload: any) {
    this.chatService.addClient(client);

    if (payload?.type === 'deleteMessage') {
      return this.chatService.deleteMessage(payload.chatId, payload.id);
    }

    const tgMessage = await this.bot.telegram.sendMessage(
      payload.chatId,
      payload.text,
    );
    await this.chatService.sendMessage(tgMessage);
  }
}
