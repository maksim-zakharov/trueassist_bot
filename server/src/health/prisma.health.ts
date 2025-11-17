// src/health/prisma.health.ts
import { Injectable } from '@nestjs/common';
import {
    HealthIndicator,
    HealthIndicatorResult,
    HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return this.getStatus(key, true);
        } catch (error) {
            const message = 'Prisma check failed';
            throw new HealthCheckError(
                message,
                this.getStatus(key, false, { message: error.message })
            );
        }
    }
}