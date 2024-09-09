import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TransactionType } from '../enum/type.enum';

export class TransactionCreateRequest {
  @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() user: string;

  @ApiProperty() @IsNotEmpty() @IsString() customerPhone: string;

  @ApiProperty() @IsNotEmpty() @IsString() invoiceNo: string;

  @ApiProperty({ default: 0 }) @IsNotEmpty() @IsNumber() amount: number;

  @ApiProperty({ default: 0 }) @IsNotEmpty() @IsNumber() points: number;

  @ApiProperty() @IsOptional() @IsString() details?: string;

  @ApiProperty({
    required: true, type: String, default: TransactionType.CREDIT,
  }) @IsNotEmpty() @IsEnum(TransactionType, {
    message: 'type must be ' + Object.values(TransactionType).join(', '),
  }) type: string;
}

export class TransactionUpdateRequest extends PartialType(TransactionCreateRequest) {
}

export class TransactionResponse {
  @ApiProperty() user: object;

  @ApiProperty() customerPhone: string;

  @ApiProperty() invoiceNo: string;

  @ApiProperty({ default: 0 }) amount: number;

  @ApiProperty({ default: 0 }) points: number;

  @ApiProperty({
    required: true, type: String, default: TransactionType.CREDIT,
  }) type: string;

  @ApiProperty() details?: string;

  @ApiProperty() createdAt: Date;

  @ApiProperty() updatedAt: Date;
}