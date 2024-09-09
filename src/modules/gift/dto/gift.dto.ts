import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class GiftCreateRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    image: string;

    @ApiProperty({ default: 0 })
    @IsOptional()
    @IsNumber()
    points: number;
}

export class GiftUpdateRequest extends PartialType(GiftCreateRequest) {}

export class GiftResponse {
    @ApiProperty()
    name: string;

    @ApiProperty()
    image: string;

    @ApiProperty({ default: 0 })
    points: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
