import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../../person/enum/role.enum';

export class SignUpRequestDto {
  @ApiProperty() @IsNotEmpty() @IsString() name: string;

  @ApiProperty() @IsNotEmpty() @IsString() phone: string;

  @ApiProperty() @IsNotEmpty() @IsString() dob: Date;

  @ApiProperty() @IsOptional() @IsString() password: string;

  @ApiProperty({ required: false, enum: Role, default: Role.USER }) @IsNotEmpty() @IsString() role: string;
}
