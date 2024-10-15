import {
    IsArray,
    IsBoolean,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
