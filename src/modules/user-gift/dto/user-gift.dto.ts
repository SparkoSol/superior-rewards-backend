import { IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserGiftStatus } from '../enum/status.enum';

export class UserGiftCreateRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() user: string;

    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() gift: string;

    @ApiProperty({
        required: true,
        type: String,
        default: UserGiftStatus.PENDING,
    })
    @IsOptional()
    @IsEnum(UserGiftStatus, {
        message: 'Gift Status must be ' + Object.values(UserGiftStatus).join(', '),
    })
    status: string;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    isExpired: boolean;
}

export class UserGiftUpdateRequest extends PartialType(UserGiftCreateRequest) {}

export class UserGiftResponse {
    @ApiProperty() user: object;

    @ApiProperty() gift: object;

    @ApiProperty({
        required: true,
        type: String,
        default: UserGiftStatus.PENDING,
    })
    status: UserGiftStatus.PENDING;

    @ApiProperty({ default: false })
    isExpired: boolean;

    @ApiProperty() qrCode?: string;

    @ApiProperty() createdAt: Date;

    @ApiProperty() updatedAt: Date;
}

export class UserGiftPostQrCodeRequest {
    @ApiProperty() @IsNotEmpty() @IsString() qrCode: string;
}
