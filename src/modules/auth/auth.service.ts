import {
    HttpStatus,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
} from '@nestjs/common';
import { PersonService } from '../person/person.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { Validations } from '../../utils/validations';
import * as mongoose from 'mongoose';

@Injectable()
export class AuthService {
    constructor(
        private personService: PersonService,
        private jwtService: JwtService
    ) {}

    async validateUser(phone: string, password: string): Promise<any> {
        const person = await this.personService.findOneByPhone(phone);

        if (!person) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'No account is associated with this phone number!',
                data: null,
            };
        }

        if (person.password !== password) {
            return {
                status: HttpStatus.UNAUTHORIZED,
                message: 'Unauthorized! Invalid password.',
                data: null,
            };
        }

        if (person.password === password) {
            const { password, ...restData } = person;
            return {
                status: HttpStatus.OK,
                message: 'User Authenticated!',
                data: restData._doc,
            };
        }
    }

    /*******************************************************************
     * signUp
     ******************************************************************/
    async signUp(data: SignUpRequest) {
        if (!(await Validations.ValidateUserRole(data.role))) {
            throw new NotAcceptableException('Invalid role.');
        }

        const query = {};
        query['phone'] = data.phone;
        query['deletedAt'] = { $eq: null };
        console.log('query: ', query);
        if (await this.personService.findOneByQuery(query)) {
            throw new NotAcceptableException('User with this phone already exist.');
        }

        try {
            const person = await this.personService.create(data);
            return {
                accessToken: this.jwtService.sign({
                    _id: person._id,
                    phone: person.phone,
                    role: person.role,
                }),
            };
        } catch (e) {
            console.log('Error while signup: ', e);
            throw new InternalServerErrorException('Error while signup: ', e);
        }
    }

    /*******************************************************************
     * signIn
     ******************************************************************/
    async signIn(person: any) {
        return {
            accessToken: this.jwtService.sign({
                _id: person._id,
                phone: person.phone,
                role: person.role,
            }),
        };
    }

    /*******************************************************************
     * getProfile
     ******************************************************************/
    async getProfile(user: any) {
        return await this.personService.findOneByQuery({
            _id: new mongoose.Types.ObjectId(user.userId),
            phone: user.phone,
            role: user.role,
        });
    }
}
