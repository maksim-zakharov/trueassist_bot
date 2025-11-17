import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {Address} from '@prisma/client';

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

    async create(data: Omit<Address, 'id'>): Promise<Address> {
        try {
            return this.prisma.address.create({
                data,
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to create address');
        }
    }

    async update(data: Address): Promise<Address> {
        try {
            return this.prisma.address.update({
                data,
                where: {id: data.id, userId: data.userId},
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
