import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class UpdateAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @IsString()
  @IsOptional()
  comments?: string;
}

