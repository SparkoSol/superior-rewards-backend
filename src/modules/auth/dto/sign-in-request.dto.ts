import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../person/enum/role.enum';

export class SignInRequest {
    @ApiProperty() @IsNotEmpty() @IsString() phone: string;

    @ApiProperty() @IsNotEmpty() @IsString() password: string;
}

export class SignInResponse {
    @ApiProperty() @IsString() accessToken: string;
}
