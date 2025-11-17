import { ApplicationStatus } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class VariantDto {
  variantId: number;
}

export class ApplicationDto {
  @Exclude() // Исключаем это поле из ответа
  'id': number;
  @Exclude() // Исключаем это поле из ответа
  'userId': string;
  'status': ApplicationStatus;
  'rejectionReason'?: string;
  @Exclude() // Исключаем это поле из ответа
  'createdAt': string;
  @Exclude() // Исключаем это поле из ответа
  'updatedAt': string;
  variants: VariantDto[];
}
