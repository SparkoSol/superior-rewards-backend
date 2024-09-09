import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'phone' });
  }

  async validate(phone: string, password: string): Promise<any> {
    const person = await this.authService.validateUser(phone, password);
    if (!person) {
      throw new UnauthorizedException();
    }
    return person;
  }
}
