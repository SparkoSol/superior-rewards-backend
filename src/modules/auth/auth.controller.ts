import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse, ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from './decorators/setmetadata.decorator';
import { PersonResponseDto } from '../person/dto/person.dto';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { SignInRequest, SignInResponse } from './dto/sign-in-request.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /*******************************************************************
     * signUp
     ******************************************************************/
    @Public()
    @ApiOkResponse({
        type: PersonResponseDto,
        description: 'Signup successful',
    })
    @ApiBody({type: SignUpRequest})
    @ApiOperation({
        description: 'Roles: ADMIN, USER',
    })
    @ApiInternalServerErrorResponse({
        description: 'Error while signup || Internal server errors.',
    })
    @ApiNotAcceptableResponse({
        description: '1:Invalid role. , 2:User with this phone already exist.',
    })
    @Post('sign-up')
    signUp(@Body() data: SignUpRequest): Promise<any> {
        return this.authService.signUp(data);
    }

    /*******************************************************************
     * signIn
     ******************************************************************/
    @Public()
    @ApiBody({
        type: SignInRequest,
        description: 'Login successfully!',
    })
    @ApiResponse({ type: SignInResponse })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @ApiNotFoundResponse({description: 'No any user found with the given phone!'})
    @ApiUnauthorizedResponse({ description: 'Unauthorized! Invalid password.' })
    @UseGuards(LocalAuthGuard)
    @Post('/sign-in')
    async signIn(@Request() req) {
        return this.authService.signIn(req.user);
    }

    /*******************************************************************
     * getProfile
     ******************************************************************/
    @ApiBearerAuth('access-token')
    @ApiResponse({ type: PersonResponseDto })
    @UseGuards(JwtAuthGuard)
    @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
    @Get('profile')
    getProfile(@Request() req) {
        return this.authService.getProfile(req.user);
    }
}
