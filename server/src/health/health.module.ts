import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import {TerminusModule} from "@nestjs/terminus";
import {HttpModule} from "@nestjs/axios";
import {PrismaHealthIndicator} from "./prisma.health";
import {PrismaService} from "../prisma.service";

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, PrismaService]
})
export class HealthModule {}
