import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserGiftTtlCreateRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() userGift: string;

    @ApiProperty() @IsNotEmpty() @IsString() createdAt: Date;
}
