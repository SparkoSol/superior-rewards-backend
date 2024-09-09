import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInRequestDto {
  @ApiProperty() @IsNotEmpty() @IsString() phone: string;

  @ApiProperty() @IsNotEmpty() @IsString() password: string;
}
