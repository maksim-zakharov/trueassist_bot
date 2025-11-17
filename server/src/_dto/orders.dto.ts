// option._dto.ts
import { Exclude, Type } from 'class-transformer';
import { OrderStatus } from '@prisma/client';

export class OptionDTO {
  id: number;
  name: string;
  price: number;
  @Exclude() // Исключаем это поле из ответа
  description: string | null;
  duration: number;
  isPopular: boolean;
  @Exclude() // Исключаем это поле из ответа
  baseServiceId: number;
}

// service-variant._dto.ts
export class ServiceVariantDTO {
  id: number;
  name: string;
  @Exclude() // Исключаем это поле из ответа
  nameAccusative: string;
  icon: string;
  basePrice: number;
  duration: number;
  @Exclude() // Исключаем это поле из ответа
  baseServiceId: number;
}

// base-service._dto.ts
export class BaseServiceDTO {
  id: number;
  name: string;
}

export class ExecutorDTO {
  @Exclude() // Исключаем это поле из ответа
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  @Exclude() // Исключаем это поле из ответа
  username: string;
  @Exclude() // Исключаем это поле из ответа
  phone: string;
  @Exclude() // Исключаем это поле из ответа
  createdAt: string;
}

export class OrderDTO {
  id: number;
  @Exclude() // Исключаем это поле из ответа
  baseServiceId: number;
  @Exclude() // Исключаем это поле из ответа
  serviceVariantId: number;
  status: OrderStatus;
  fullAddress: string;
  date: string; // ISO 8601
  @Exclude() // Исключаем это поле из ответа
  userId: string;
  @Exclude() // Исключаем это поле из ответа
  completedAt: string;
  @Exclude() // Исключаем это поле из ответа
  startedAt: string;
  executorId: string | null;
  comment: string | null;

  @Type(() => BaseServiceDTO)
  baseService: BaseServiceDTO;

  @Type(() => ServiceVariantDTO)
  serviceVariant: ServiceVariantDTO;

  @Type(() => OptionDTO)
  options: OptionDTO[];

  @Type(() => ExecutorDTO)
  executor?: ExecutorDTO;
}
