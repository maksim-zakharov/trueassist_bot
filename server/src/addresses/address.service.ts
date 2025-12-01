import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {Address, Prisma} from '@prisma/client';

@Injectable()
export class AddressesService {
    constructor(private prisma: PrismaService) {
    }

    getById(id: Address['id'], userId: Address['userId']) {
        return this.prisma.address.findUnique({
            where: {id, userId}
        })
    }

    getAll(userId: Address['userId']) {
        return this.prisma.address.findMany({
            where: {userId}
        })
    }

    async create(data: Prisma.AddressCreateInput): Promise<Address> {
        try {
            return this.prisma.address.create({
                data,
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to create address');
        }
    }

    async update(data: { id: number; userId: string } & Prisma.AddressUpdateInput): Promise<Address> {
        try {
            const { id, userId, ...updateData } = data;
            return this.prisma.address.update({
                data: updateData,
                where: { id, userId },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to update address');
        }
    }

    async delete(id: Address['id']): Promise<Address> {
        try {
            return this.prisma.address.delete({
                where: {id},
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to delete address');
        }
    }
}
