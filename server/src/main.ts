import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { BusinessExceptionFilter } from './common/filters/business-exception.filter';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { IoAdapter } from '@nestjs/platform-socket.io';
import logger from './logger';
import * as process from 'node:process';

dayjs.extend(utc);
dayjs.extend(timezone);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
    cors: true,
  });

  // Включаем трансформацию
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useWebSocketAdapter(new IoAdapter(app));

  // app.useGlobalFilters(new HttpExceptionFilter());
  // // Глобальная валидация
  // app.useGlobalPipes(
  //     new ValidationPipe({
  //         transform: true,
  //         whitelist: true,
  //         forbidNonWhitelisted: true,
  //         exceptionFactory: (errors) => new BadRequestException(formatValidationErrors(errors)),
  //     }),
  // );

  app.useGlobalFilters(new BusinessExceptionFilter());

  // Проверка подключения к Prisma
  const prisma = app.get(PrismaService);
  await prisma
    .$connect()
    .then(() => console.log('✅ Подключение к БД успешно'))
    .catch((err) => {
      console.error('❌ Ошибка подключения к БД:', err);
      process.exit(1);
    });

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, '0.0.0.0');

  console.log(process.env);
}

bootstrap();
