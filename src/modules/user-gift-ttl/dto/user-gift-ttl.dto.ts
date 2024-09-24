import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserGiftTtlCreateRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() user: string;

    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() gift: string;

    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() reference: string;

    @ApiProperty({ default: false }) @IsOptional() @IsBoolean() isExpired: boolean;

    @ApiProperty() @IsNotEmpty() @IsString() createdAt: Date;
}
