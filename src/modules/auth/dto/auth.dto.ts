import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

export class ForgotPasswordRequest {
    @IsEmail()
    @ApiProperty()
    @IsNotEmpty()
    email: string;
}

export class ResetPasswordRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    verificationCode: string;

    @ApiProperty({ type: String, format: 'password' })
    @IsNotEmpty()
    @IsString()
    password: string;
}

export class AccountVerification {
    @ApiProperty()
    @IsString()
    @Prop()
    verificationHash: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsMongoId()
    id: string;
}
