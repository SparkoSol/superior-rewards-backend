import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsArray,
    IsMongoId,
    IsBoolean,
    IsNumber,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { filterPayload, PersonResponseDto } from '../../person/dto/person.dto';

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

export class NotificationFiltersDto {
    @ApiProperty({ description: 'Page No - Starting Page is 1', default: 1 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page: number;

    @ApiProperty({ description: 'Page Size - Default is 10', default: 10 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    pageSize: number;

    @ApiProperty({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    withPopulate?: boolean;

    @ApiProperty({
        required: false,
        name: 'markAsRead',
        description: 'For Getting all Read/UnRead notifications',
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    markAsRead?: boolean;

    @ApiProperty({
        required: false,
        name: 'user',
        description: 'Find all notifications by UserId',
    })
    @IsOptional()
    @IsString()
    user?: string;

    @ApiProperty({ description: 'Filter object' })
    @IsOptional()
    @IsObject()
    // filters?: Record<string, any>;
    filters?: filterPayload;
}

export class PaginatedNotificationResponseDto {
    @ApiProperty()
    filters?: filterPayload;

    @ApiProperty({ type: [NotificationResponseDto] })
    data: [NotificationResponseDto];

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
