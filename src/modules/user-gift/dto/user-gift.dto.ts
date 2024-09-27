import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { GiftStatus } from '../enum/status.enum';

export class UserGiftCreateRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() user: string;

    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() gift: string;

    @ApiProperty({
        required: true,
        type: String,
        default: GiftStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(GiftStatus, {
        message: 'Gift Status must be ' + Object.values(GiftStatus).join(', '),
    })
    status: string;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    isExpired: boolean;

    @ApiProperty() @IsOptional() @IsString() redeemedAt: Date;

    @ApiProperty() @IsOptional() @IsString() qrCode?: string;
}

export class UserGiftUpdateRequest extends PartialType(UserGiftCreateRequest) {}

export class UserGiftResponse {
    @ApiProperty() user: object;

    @ApiProperty() gift: object;

    @ApiProperty({
        required: true,
        type: String,
        default: GiftStatus.PENDING,
    })
    status: GiftStatus.PENDING;

    @ApiProperty({ default: false })
    isExpired: boolean;

    @ApiProperty() redeemedAt: Date;

    @ApiProperty() qrCode?: string;

    @ApiProperty() createdAt: Date;

    @ApiProperty() updatedAt: Date;
}
