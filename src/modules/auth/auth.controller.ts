import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
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
    ApiQuery,
    ApiResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from './decorators/setmetadata.decorator';
import { PersonResponseDto } from '../person/dto/person.dto';
import { AdminCreateUserRequest, MobileSignUpRequest, SignUpResponse } from './dto/sign-up-request.dto';
import { SignInRequest, SignInResponse } from './dto/sign-in-request.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /*******************************************************************
     * adminSignUp
     ******************************************************************/
    @Public()
    @ApiOkResponse({
        type: SignUpResponse,
        description: 'AdminSignup successful',
    })
    @ApiBody({ type: AdminCreateUserRequest })
    @ApiInternalServerErrorResponse({
        description: 'Error while adminSignUp || Internal server errors.',
    })
    @ApiNotAcceptableResponse({
        description: '1: User with this phone already exist.',
    })
    @Post('admin/sign-up')
    adminSignUp(@Body() data: AdminCreateUserRequest): Promise<any> {
        return this.authService.adminSignUp(data);
    }

    /*******************************************************************
     * signUp
     ******************************************************************/
    @Public()
    @ApiOkResponse({
        type: SignUpResponse,
        description: 'Signup successful',
    })
    @ApiBody({ type: MobileSignUpRequest })
    @ApiInternalServerErrorResponse({
        description: 'Error while signup || Internal server errors.',
    })
    @ApiNotAcceptableResponse({
        description: '1: User with this phone already exist., 2: Invalid role, please contact admin to add User role.',
    })
    @Post('sign-up')
    signUp(@Body() data: MobileSignUpRequest): Promise<any> {
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
    async signIn(@Request() req: any) {
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
