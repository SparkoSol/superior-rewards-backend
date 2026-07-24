import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidPhone } from '../../../utils/phone.validator';

export class SignInRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsValidPhone() phone: string;

    @ApiProperty() @IsNotEmpty() @IsString() password: string;
}

export class SignOutRequest {
    @ApiProperty() @IsNotEmpty() @IsString() fcmToken: string;
}

export class SignInResponse {
    @ApiProperty() @IsString() accessToken: string;
}
