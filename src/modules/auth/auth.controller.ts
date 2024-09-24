import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post, Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation, ApiQuery,
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
        type: SignInResponse,
        description: 'Signup successful',
    })
    @ApiBody({ type: SignUpRequest })
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
    @ApiOkResponse({ type: SignInResponse })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @ApiNotFoundResponse({ description: 'No account is associated with this phone number!' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized! Invalid password.' })
    @HttpCode(HttpStatus.OK)
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
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    getProfile(@Request() req, @Query('withPopulate') withPopulate?: boolean): Promise<any> {
        return this.authService.getProfile(req.user, withPopulate);
    }
}
