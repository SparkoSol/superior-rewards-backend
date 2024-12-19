import {
    ArrayNotEmpty,
    IsArray,
    IsBoolean,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UserGiftStatus } from '../enum/status.enum';
import { Type } from 'class-transformer';
import { filterPayload, PersonResponseDto, populatedPayload } from '../../person/dto/person.dto';

export class UserGiftCreateRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsMongoId() user: string;

    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsMongoId({ each: true })
    gifts: string[];

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

    @ApiProperty({ default: 0 })
    @IsNotEmpty()
    @IsNumber()
    totalPoints: number;
}

export class UserGiftUpdateRequest extends PartialType(UserGiftCreateRequest) {}

export class UserGiftResponse {
    @ApiProperty() user: object;

    @ApiProperty()
    gifts: string[];

    @ApiProperty({
        required: true,
        type: String,
        default: UserGiftStatus.PENDING,
    })
    status: UserGiftStatus.PENDING;

    @ApiProperty({ default: false })
    isExpired: boolean;

    @ApiProperty() qrCode?: string;

    @ApiProperty({ default: 0 })
    totalPoints: number;

    @ApiProperty() createdAt: Date;

    @ApiProperty() updatedAt: Date;
}

export class UserGiftPostQrCodeRequest {
    @ApiProperty() @IsNotEmpty() @IsString() qrCode: string;
}

export class UserGiftRedeemedRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() userGiftId: string;
}

export class UserGiftFiltersDto {
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
        name: 'user',
        description: 'for getting all gifts of specific user',
    })
    @IsOptional()
    @IsString()
    user?: string;

    @ApiProperty({
        required: false,
        name: 'status',
        description: 'for getting all gifts of specific status',
    })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ description: 'Filter object' })
    @IsOptional()
    @IsObject()
    filters?: filterPayload;

    @ApiProperty({ description: 'PopulatedFilter object' })
    @IsOptional()
    @IsObject()
    populated?: populatedPayload;
}

export class PaginatedUserGiftResponseDto {
    @ApiProperty()
    filters?: filterPayload;

    @ApiProperty({ type: [UserGiftResponse] })
    data: [UserGiftResponse];

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
