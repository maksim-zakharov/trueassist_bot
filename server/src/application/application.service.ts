import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  Application,
  ApplicationStatus,
  ServiceVariant,
  User,
} from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  submitApplication(
    executorId: User['id'],
    variantIds: ServiceVariant['id'][],
  ) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: { userId: executorId },
      });
      if (application) {
        return application;
      }

      return tx.application.create({
        data: {
          user: { connect: { id: executorId } },
          variants: {
            create: variantIds.map((variantId) => ({ variantId })),
          },
        },
      });
    });
  }

  approveApplication(id: Application['id']) {
    return this.changeApplicationStatus(id, ApplicationStatus.APPROVED);
  }

  rejectApplication(id: Application['id']) {
    return this.changeApplicationStatus(id, ApplicationStatus.REJECTED);
  }

  changeApplicationStatus(id: Application['id'], status: ApplicationStatus) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.application.findUnique({
        where: {
          id,
        },
      });

      if (!application) {
        throw new NotFoundException({ message: 'Application not found' });
      }

      application.status = status;

      return tx.application.update({
        data: application,
        where: {
          id,
        },
      });
    });
  }

  getApplications() {
    return this.prisma.application.findMany({
      include: {
        user: true,
      },
    });
  }

  getApplication(executorId: User['id']) {
    return this.prisma.application.findUnique({
      where: { userId: executorId },
      include: {
        variants: {
          select: {
            variantId: true,
          },
        },
      },
    });
  }
}
