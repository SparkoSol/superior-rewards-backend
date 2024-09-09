import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SignInRequest {
  @ApiProperty()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  // @ApiProperty({ type: Boolean })
  // isSignedIn: boolean;
}
