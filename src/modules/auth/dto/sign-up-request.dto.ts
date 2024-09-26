import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../person/enum/role.enum';

export class SignUpRequest {
    @ApiProperty() @IsNotEmpty() @IsString() name: string;

    @ApiProperty() @IsNotEmpty() @IsString() phone: string;

    @ApiProperty() @IsNotEmpty() @IsISO8601() dob: Date;

    @ApiProperty() @IsOptional() @IsString() address?: string;

    @ApiProperty() @IsOptional() @IsString() password: string;

    @ApiProperty({ required: false, enum: Role, default: Role.USER })
    @IsNotEmpty()
    @IsString()
    role: string;

    odooCustomerId?: number;
}
