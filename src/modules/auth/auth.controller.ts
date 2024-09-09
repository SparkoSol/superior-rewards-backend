import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse, ApiBearerAuth, ApiBody,
  ApiInternalServerErrorResponse, ApiNotAcceptableResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from './decorators/setmetadata.decorator';
import { PersonResponseDto } from '../person/dto/person.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

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

  /*******************************************************************
   * signIn
   ******************************************************************/
  @Public()
  @ApiBody({ type: SignInRequestDto, description: 'Login successfully!' })
  @ApiInternalServerErrorResponse({ description: 'Internal server errors.' })
  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(@Request() req) {
    return this.authService.signIn(req.user);
  }

  /*******************************************************************
   * getProfile
   ******************************************************************/
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @Get('profile')
  getProfile(@Request() req) {
    console.log('req.user: ', req.user);
    return this.authService.getProfile(req.user);
  }
}
