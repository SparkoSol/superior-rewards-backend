import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class TransactionCreateRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  invoiceNo: string;

  @ApiProperty({default: 0})
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({default: 0})
  @IsNotEmpty()
  @IsNumber()
  points: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  details?: string;
}

export class TransactionUpdateRequest extends PartialType(
  TransactionCreateRequest,
) {}

export class TransactionResponse {
  @ApiProperty()
  customerPhone: string;

  @ApiProperty()
  invoiceNo: string;

  @ApiProperty({default: 0})
  amount: number;

  @ApiProperty({default: 0})
  points: number;

  @ApiProperty()
  details?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}