import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { GiftStatus } from '../enum/status.enum';

export class UserGiftCreateRequest {
  @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() user: string;

  @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() gift: string;

  @ApiProperty({
    required: true, type: String, default: GiftStatus.IN_PROGRESS,
  }) @IsOptional() @IsEnum(GiftStatus, {
    message: 'Gift Status must be ' + Object.values(GiftStatus).join(', '),
  }) status: string;

  @ApiProperty() @IsOptional() @IsString() redeemedAt: Date;
}

export class UserGiftUpdateRequest extends PartialType(UserGiftCreateRequest) {
}

export class UserGiftResponse {
  @ApiProperty() user: object;

  @ApiProperty() gift: object;

  @ApiProperty({
    required: true, type: String, default: GiftStatus.IN_PROGRESS,
  }) status: GiftStatus.IN_PROGRESS;

  @ApiProperty() redeemedAt: Date;

  @ApiProperty() createdAt: Date;

  @ApiProperty() updatedAt: Date;
}