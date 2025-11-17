import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseService, ServiceOption } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  getById(id: BaseService['id']) {
    return this.prisma.baseService.findUnique({
      where: { id },
      include: {
        options: true,
        variants: true,
      },
    });
  }

  getVariantById(id: BaseService['id']) {
    return this.prisma.serviceVariant.findUnique({
      where: { id },
      include: {
        baseService: true,
        variants: true,
      },
    });
  }

  getVariants() {
    return this.prisma.serviceVariant.findMany({
      include: {
        baseService: true,
      },
    });
  }

  getAll(includeDeleted = false) {
    return this.prisma.baseService.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      include: {
        options: true,
        variants: true,
      },
    });
  }

  async create(
    data: BaseService & { options: ServiceOption[]; variants: any[] },
  ): Promise<BaseService> {
    return this.prisma.baseService.create({
      data: {
        name: data.name,
        options: {
          create: data.options.map(({ id, ...o }) => o),
        },
        variants: {
          create: data.variants.map(({ id, ...o }) => o),
        },
      },
      include: {
        options: true,
        variants: true,
      },
    });
  }

  async update(
    data: BaseService & {
      options: any[];
      variants: any[];
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const service = await tx.baseService.findUnique({
        where: { id: data.id },
        include: {
          variants: true,
          options: true,
        },
      });
      if (!service) throw new NotFoundException('Service not found');

      const dataOptionsSet = new Set(data.options?.map((o) => o.id) || []);
      const dataVariantsSet = new Set(data.variants?.map((o) => o.id) || []);

      // Опции которые надо удалить
      const optionsToDelete = service.options.filter(
        (o) => !dataOptionsSet.has(o.id),
      );
      if (optionsToDelete.length > 0) {
        await tx.serviceOption.deleteMany({
          where: { id: { in: optionsToDelete.map((o) => o.id) } },
        });
      }

      // Варианты которые надо удалить
      const variantsToDelete = service.variants.filter(
        (o) => !dataVariantsSet.has(o.id),
      );
      if (variantsToDelete.length > 0) {
        await tx.serviceVariant.deleteMany({
          where: { id: { in: variantsToDelete.map((o) => o.id) } },
        });
      }

      // Опции которые надо обновить
      const optionsToUpdate = service.options.filter((o) =>
        dataOptionsSet.has(o.id),
      );
      if (optionsToUpdate.length > 0) {
        await Promise.all(
          optionsToUpdate.map((option) =>
            tx.serviceOption.update({
              where: { id: option.id },
              data: option,
            }),
          ),
        );
      }

      // Варианты которые надо обновить
      const variantsToUpdate = service.variants.filter((o) =>
        dataVariantsSet.has(o.id),
      );
      if (variantsToUpdate.length > 0) {
        await Promise.all(
          variantsToUpdate.map((option) =>
            tx.serviceVariant.update({
              where: { id: option.id },
              data: option,
            }),
          ),
        );
      }

      const existOptionsSet = new Set(service.options.map((v) => v.id) || []);
      const existVariantsSet = new Set(service.variants.map((v) => v.id) || []);

      // Опции которые надо добавить
      const optionsToCreate = data.options.filter(
        (o) => !existOptionsSet.has(o.id),
      );
      if (optionsToCreate.length > 0) {
        await Promise.all(
          optionsToCreate.map(({ id, ...option }) =>
            tx.serviceOption.create({
              data: {
                ...option,
                baseServiceId: service.id,
              },
            }),
          ),
        );
      }

      // Варианты которые надо добавить
      const variantsToCreate = data.variants.filter(
        (o) => !existVariantsSet.has(o.id),
      );
      if (variantsToCreate.length > 0) {
        await Promise.all(
          variantsToCreate.map(({ id, ...option }) =>
            tx.serviceVariant.create({
              data: {
                ...option,
                baseServiceId: service.id,
              },
            }),
          ),
        );
      }

      const { id, options, variants, ...onlyData } = data;

      return tx.baseService.update({
        where: {
          id: data.id,
        },
        data: onlyData,
        include: {
          options: true,
          variants: true,
        },
      });
    });
  }

  async restore(id: BaseService['id']): Promise<BaseService> {
    return this.prisma.baseService.update({
      data: {
        deletedAt: null,
      },
      where: { id },
    });
  }

  async delete(id: BaseService['id']): Promise<BaseService> {
    return this.prisma.baseService.delete({
      where: { id },
    });
  }
}
