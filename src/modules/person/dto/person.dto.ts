import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Role } from '../enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class PersonUpdateDto {
  @ApiProperty() @IsOptional() @IsString() name: string;

  @ApiProperty() @IsNotEmpty() @IsString() phone: string;

  @ApiProperty() @IsNotEmpty() @IsString() date: Date;

  @ApiProperty() @IsOptional() @IsString() profilePicture?: string;

  @ApiProperty({
    required: true, type: String, default: Role.ADMIN,
  }) @IsOptional() @IsEnum(Role, {
    message: 'Role must be ' + Object.values(Role).join(', '),
  }) role: string;

  @ApiProperty({ type: [String] }) @IsOptional() @IsArray() fcmTokens: string[];

  @ApiProperty({ default: 0 }) @IsOptional() @IsNumber() points: number;

  @ApiProperty() @IsOptional() @IsString() deletedAt?: Date;
}

export class PersonResponseDto {
  @ApiProperty() name: string;

  @ApiProperty() phone: string;

  @ApiProperty() dob: Date;

  @ApiProperty() profilePicture?: string;

  @ApiProperty({
    enum: Role, example: Role.ADMIN,
  }) role: string;

  @ApiProperty({ type: [String] }) fcmTokens: string[];

  @ApiProperty({ default: 0 }) points: number;

  @ApiProperty() deletedAt?: Date;

  @ApiProperty() createdAt: Date;

  @ApiProperty() updatedAt: Date;
}

export class UpdateFcmTokenRequestDto {
  @ApiProperty({ required: true }) @IsNotEmpty() @IsString() fcmToken: string;
}

