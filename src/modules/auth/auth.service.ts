import { Injectable, NotAcceptableException } from '@nestjs/common';
import { PersonService } from '../person/person.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { Validations } from '../../utils/validations';
import { rethrow } from '@nestjs/core/helpers/rethrow';

@Injectable()
export class AuthService {
  constructor(private personService: PersonService, private jwtService: JwtService) {
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.personService.findOne(username);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /*******************************************************************
   * signUp
   ******************************************************************/
  async signUp(data: SignUpRequestDto) {
    if (!(await Validations.ValidateUserRole(data.role))) {
      throw new NotAcceptableException('Invalid role.');
    }

    try {
      const result = (await this.personService.create(data)) as any;
      const { password, ...user } = result._doc;

      return user;
    } catch (e) {
      console.log('Error while signup: ', e);
      rethrow(e);
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
