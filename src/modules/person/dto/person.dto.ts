import {
    IsArray,
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileDTO } from '../../../uploadFileStructue/dto/file.dto';
import { Transform, Type } from 'class-transformer';

export class PersonCreateDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    dob?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    role: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    points: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    redeemedPoints: number;

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    addedInOdoo: boolean;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    customerNumber?: number;

    odooCustomerId?: number;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsMongoId()
    performedBy?: string;
}

export class PersonUpdateDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    dob?: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsMongoId()
    role?: string;

    @ApiProperty({ type: [String] })
    @IsOptional()
    @IsArray()
    fcmTokens?: string[];

    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsNumber()
    points?: number;

    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsNumber()
    redeemedPoints?: number;

    @ApiProperty({ default: false })
    @IsOptional()
    @IsBoolean()
    addedInOdoo?: boolean;

    @ApiProperty()
    @IsOptional()
    @IsString()
    deletedAt?: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    country?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    customerNumber?: number;
}

export class PersonResponseDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    phone: string;

    @ApiProperty()
    dob: Date;

    @ApiProperty()
    address?: string;

    @ApiProperty()
    profilePicture?: string;

    @ApiProperty()
    role: object;

    @ApiProperty({ type: [String] })
    fcmTokens?: string[];

    @ApiProperty({ default: 0 })
    points: number;

    @ApiProperty({ default: 0 })
    redeemedPoints: number;

    @ApiProperty({ default: false })
    addedInOdoo: boolean;

    @ApiProperty()
    email?: string;

    @ApiProperty()
    country?: string;

    @ApiProperty()
    customerNumber?: number;

    @ApiProperty()
    performedBy?: object;

    @ApiProperty() deletedAt?: Date;

    @ApiProperty() createdAt: Date;

    @ApiProperty() updatedAt: Date;
}

export class UpdateFcmTokenRequestDto {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @IsString()
    fcmToken: string;
}

export class PasswordUpdateRequestDto {
    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    @ApiProperty({ required: true, description: 'Person Id' })
    person: string;

    @IsString()
    @ApiProperty({ required: true })
    oldPassword: string;

    @IsString()
    @ApiProperty({ required: true })
    newPassword: string;
}

export class BulkUploadDto {
    @ApiProperty({
        required: true,
        type: 'string',
        format: 'binary',
        description: 'Excel File',
    })
    @IsOptional()
    @IsObject()
    file: FileDTO;
}

export class BulkUploadResponseDto {
    @ApiProperty()
    totalDocs: number;

    @ApiProperty()
    successDocs: number;

    @ApiProperty()
    failedDocs: number;
}

export class PersonQueryDto {
    @ApiProperty({ description: 'Page No - Starting Page is 1' })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page: number;

    @ApiProperty({ description: 'Page Size - Default is 10' })
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
        name: 'usedFor',
        description: 'for determine whether the request is from "users" or "customers"',
    })
    @IsOptional()
    @IsString()
    usedFor?: string;
}

export class filterPayload {
    @ApiProperty()
    'field[op]': string;
}

export class populatedPayload {
    @ApiProperty()
    'table[filed]': string;
}

export class PersonFiltersDto {
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
        name: 'usedFor',
        description: 'for determine whether the request is from "users" or "customers"',
    })
    @IsOptional()
    @IsString()
    usedFor?: string;

    @ApiProperty({ description: 'Filter object' })
    @IsOptional()
    @IsObject()
    // filters?: Record<string, any>;
    filters?: filterPayload;

    @ApiProperty({ description: 'PopulatedFilter object' })
    @IsOptional()
    @IsObject()
    populated?: populatedPayload;
}

export class PaginatedPersonResponseDto {
    @ApiProperty()
    filters?: filterPayload;

    @ApiProperty({ type: [PersonResponseDto] })
    data: [PersonResponseDto];

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
