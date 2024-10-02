import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdminCreateUserRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsOptional()
    @IsISO8601()
    dob?: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsMongoId()
    role: string;
}

export class MobileSignUpRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsISO8601()
    dob: Date;

    @ApiProperty()
    @IsOptional()
    @IsString()
    password: string;

    role?: string;

    odooCustomerId?: number;
}

export class SignUpResponse {
    @ApiProperty() @IsString() accessToken: string;
}
