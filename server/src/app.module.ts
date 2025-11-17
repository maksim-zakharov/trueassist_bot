import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { PrismaService } from './prisma.service';
import { AddressesService } from './addresses/address.service';
import { OrdersService } from './orders/orders.service';
import { ServicesService } from './services/services.service';
import { ServicesController } from './services/services.controller';
import { OrdersController } from './orders/orders.controller';
import { AddressesController } from './addresses/addresses.controller';
import { SpaController } from './spa/spa.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { UserService } from './user/user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { Context, session, Telegraf } from 'telegraf';
import { OpenaiService } from './openai/openai.service';
import { OpenaiProxyController } from './openai-proxy/openai-proxy.controller';
import OpenAI from 'openai';
import * as process from 'node:process';
import { HttpModule } from '@nestjs/axios';
import { ExecutorController } from './executor/executor.controller';
import { ScheduleController } from './schedule/schedule.controller';
import { ScheduleService } from './schedule/schedule.service';
import { RolesGuard } from './auth/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { ApplicationController } from './application/application.controller';
import { ApplicationService } from './application/application.service';
import { AdminController } from './admin/admin.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [
    HealthModule,
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    CacheModule.register({
      ttl: 3600 * 24, // 24 часа
      max: 1000,
      // store: redisStore,
      // host: 'localhost',
      // port: 6379,
      // Для in-memory кэша:
      store: 'memory',
    }),
  ],
  controllers: [
    ServicesController,
    OrdersController,
    AddressesController,
    AppController,
    AuthController,
    ExecutorController,
    ScheduleController,
    ApplicationController,
    AdminController,
    SpaController,
    OpenaiProxyController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
    PrismaService,
    AddressesService,
    OrdersService,
    ServicesService,
    AuthService,
    UserService,
    JwtStrategy,
    {
      provide: Telegraf,
      useFactory: async () => {
        const bot = new Telegraf<Context>(process.env.TELEGRAM_BOT_TOKEN, {
          handlerTimeout: Infinity,
        });

        bot.use(session());
        // bot.use(stage.middleware());

        bot
          .launch()
          .catch((e) =>
            console.error(`Не удалось запустить телеграмм-бота`, e.message),
          );

        if (bot)
          bot.telegram
            .getMe()
            .then((res) =>
              console.log(`Bot started on https://t.me/${res.username}`),
            )
            .catch((e) =>
              console.log(`Не удалось запустить телеграмм-бота`, e.message),
            );

        return bot;
      },
    },
    {
      provide: OpenAI,
      useFactory: () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
    },
    OpenaiService,
    ScheduleService,
    ApplicationService,
    ChatGateway,
    ChatService,
  ],
  exports: [PrismaService],
})
export class AppModule {}
