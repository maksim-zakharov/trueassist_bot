import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BonusOperation, Order, User } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: User['id']) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<User> {
    try {
      return this.prisma.user.create({
        data: {
          id: data.id.toString(),
          firstName: data.first_name,
          lastName: data.last_name,
          photoUrl: data.photo_url,
          phone: data.phone_number,
          username: data.username,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(data: any): Promise<User> {
    try {
      return this.prisma.user.update({
        where: { id: data.id },
        data: {
          id: data.id,
          firstName: data.firstName,
          lastName: data.lastName,
          photoUrl: data.photoUrl,
          phone: data.phone,
          username: data.username,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  getBonusOperations(userId: User['id']) {
    return this.prisma.bonusOperation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  addBonus(_data: BonusOperation) {
    const { id, ...data } = _data;
    return this.prisma.bonusOperation.create({
      data,
    });
  }

  getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({});
  }
}
