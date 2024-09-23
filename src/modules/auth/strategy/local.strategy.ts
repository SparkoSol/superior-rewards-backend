import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'phone' });
    }

    async validate(phone: string, password: string): Promise<any> {
        const response = await this.authService.validateUser(phone, password);

        if (response.status !== HttpStatus.OK) {
            throw new HttpException(response.message, response.status);
        }

        return response.data;
    }
}
