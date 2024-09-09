import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Role } from '../enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class PersonUpdateDto {
  @ApiProperty() @IsOptional() @IsString() name: string;

  @ApiProperty() @IsNotEmpty() @IsString() phone: string;

  @ApiProperty() @IsNotEmpty() @IsString() date: Date;

  @ApiProperty() @IsOptional() @IsString() @IsEmail() email?: string;

  @ApiProperty() @IsOptional() @IsString() profilePicture?: string;

  @ApiProperty({
    required: true, type: String, default: Role.ADMIN,
  }) @IsOptional() @IsEnum(Role, {
    message: 'Role must be ' + Object.values(Role).join(', '),
  }) role: string;

  @ApiProperty() @IsOptional() @IsString() description?: string;

  @ApiProperty({ type: [String] }) @IsOptional() @IsArray() fcmTokens: string[];
}

export class PersonResponseDto {
  @ApiProperty() name: string;

  @ApiProperty() phone: string;

  @ApiProperty() dob: Date;

  @ApiProperty() email?: string;

  @ApiProperty() profilePicture?: string;

  @ApiProperty({
    enum: Role, example: [Role.ADMIN, Role.USER],
  }) role: string;

  @ApiProperty() description?: string;

  @ApiProperty({ type: [String] }) fcmTokens: string[];

  @ApiProperty() createdAt: Date;

  @ApiProperty() updatedAt: Date;
}

export class UpdateFcmTokenRequestDto {
  @ApiProperty({ required: true }) @IsNotEmpty() @IsString() fcmToken: string;
}

