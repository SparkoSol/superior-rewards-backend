import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsMongoId, IsBoolean } from 'class-validator';

export class NotificationCreateDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    body: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    imageUrl: string;

    @ApiProperty()
    @IsOptional()
    @IsMongoId()
    user: string;

    @ApiProperty({ type: Boolean, default: false })
    @IsOptional()
    @IsBoolean()
    markAsRead: boolean;
}

export class NotificationUpdateDto extends PartialType(NotificationCreateDto) {}

export class NotificationPayload {
    @ApiProperty()
    @IsOptional()
    @IsString()
    title: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    body: string;
}

export class NotificationPayloadForMultipleDeviceDto extends NotificationPayload {
    @ApiProperty({ type: [String] })
    @IsOptional()
    @IsArray()
    fcmTokens: [string];
}

export class NotificationResponseDto {
    @ApiProperty()
    title: string;

    @ApiProperty()
    body: string;

    @ApiProperty()
    user: object;

    @ApiProperty({ type: Boolean, default: false })
    markAsRead: boolean;

    @ApiProperty()
    createdAt: string;

    @ApiProperty()
    updatedAt: string;
}
