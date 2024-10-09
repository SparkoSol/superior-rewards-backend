import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserGiftTtlCreateRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() _id: string; // userGift

    @ApiProperty() @IsNotEmpty() @IsString() expireAt: Date;
}
