import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SettingRequest {
    @ApiProperty({ default: 1 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @ApiProperty({ default: 1 })
    @IsNotEmpty()
    @IsNumber()
    points: number;
}

export class SettingResponse {
    @ApiProperty()
    amount: number;

    @ApiProperty({ default: 0 })
    points: number;

    @ApiProperty() deletedAt?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
