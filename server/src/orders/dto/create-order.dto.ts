import {
  IsArray,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class BaseServiceDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class ServiceVariantDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  basePrice: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  baseServiceId: number;
}

class ServiceOptionDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  baseServiceId: number;
}

export class CreateOrderDto {
  @ValidateNested()
  @Type(() => BaseServiceDto)
  baseService: BaseServiceDto;

  @ValidateNested()
  @Type(() => ServiceVariantDto)
  serviceVariant: ServiceVariantDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceOptionDto)
  @IsOptional()
  options?: ServiceOptionDto[];

  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsInt()
  @IsOptional()
  bonus?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
