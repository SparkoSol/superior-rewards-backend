import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  firebaseUserId?: string;

  @ApiProperty({ required: false, enum: Role })
  @IsNotEmpty()
  @IsString()
  role: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profilePicture: string;

  @ApiProperty({ type: Boolean, default: false })
  @IsOptional()
  @IsBoolean()
  socialAuth: boolean;
}
