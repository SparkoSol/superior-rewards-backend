import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse, ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from './decorators/setmetadata.decorator';
import { PersonResponseDto } from '../person/dto/person.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {
  }

  /*******************************************************************
   * signUp
   ******************************************************************/
  @Public()
  @ApiOkResponse({ type: PersonResponseDto, description: 'SignUp successful' })
  @ApiOperation({
    description:
      'Roles: ADMIN, USER',
  })
  @ApiBadRequestResponse({ description: 'Issue in request data' })
  @ApiInternalServerErrorResponse({ description: 'Error while signup || Internal server errors.' })
  @ApiNotAcceptableResponse({
    description:
      '1:Invalid role., 2:User with this phone already exist.',
  })
  @Post('sign-up')
  signUp(@Body() data: SignUpRequestDto): Promise<any> {
    return this.authService.signUp(data);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // @UseGuards(AuthGuard('local')) @Post('auth/login')
  // async login(@Request() req) {
  //   return req.user;
  // }
}
