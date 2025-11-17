import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import * as process from 'node:process';
import { JwtService } from '@nestjs/jwt';
import { ApplicationStatus, BonusOperationType } from '@prisma/client';
import { PrismaService } from '../prisma.service';

export function validateInitData(initData: string) {
  // 1. Получаем секретный ключ
  const secret_key = HMAC_SHA256(process.env.TELEGRAM_BOT_TOKEN, 'WebAppData');

  // 2. Извлекаем параметры
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');

  // 3. Сортируем параметры
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');

  function HMAC_SHA256(value, key) {
    return createHmac('sha256', key).update(value).digest();
  }

  function hex(bytes) {
    return bytes.toString('hex');
  }

  // 4. Вычисляем хеш
  const hashGenerate = hex(HMAC_SHA256(dataCheckString, secret_key));

  // Return bool value is valid
  return Boolean(hashGenerate === hash);
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(userDTO: any, refId?: any) {
    return this.prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { id: userDTO.id.toString() },
      });

      if (!user) {
        user = await tx.user.create({
          data: {
            id: userDTO.id.toString(),
            firstName: userDTO.first_name,
            lastName: userDTO.last_name,
            photoUrl: userDTO.photo_url,
            phone: userDTO.phone_number,
            username: userDTO.username,
            refId,
          },
        });

        if (refId) {
          const referrer = await tx.user.findUnique({
            where: {
              id: refId,
            },
          });

          if (!referrer) throw new NotFoundException('Referrer not found');

          // Начисляем бонус тому кто пригласил
          await tx.bonusOperation.create({
            data: {
              userId: refId,
              type: BonusOperationType.INVITE,
              value: 300,
              description: `${user.firstName} ${user.lastName}`,
            },
          });

          // Начисляем бонус приглашенному
          await tx.bonusOperation.create({
            data: {
              userId: user.id,
              type: BonusOperationType.INVITE,
              value: 50,
            },
          });
        }
      }

      return user;
    });
  }

  async login(user: any, role?: string) {
    const data = user;
    data.role = 'client';
    if (role === 'executor') {
      const application = await this.prisma.application.findUnique({
        where: { userId: user.id.toString() },
      });
      if (!application || application.status !== ApplicationStatus.APPROVED) {
        data.role = 'client';
      }
    }
    if (role === 'admin' && !user.isAdmin) {
      throw new UnauthorizedException({ message: 'User is not authorized' });
    }
    data.role = role;
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
