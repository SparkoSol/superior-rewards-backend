import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SettingRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    user: string;

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
    user: object;
    
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
