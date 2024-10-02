import {
    forwardRef,
    HttpStatus, Inject,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
} from '@nestjs/common';
import { PersonService } from '../person/person.service';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequest } from './dto/sign-up-request.dto';
import { Validations } from '../../utils/validations';
import * as mongoose from 'mongoose';
import * as admin from 'firebase-admin';
import * as process from 'process';

@Injectable()
export class AuthService {
    private readonly defaultApp: any;

    constructor(
        @Inject(forwardRef(() => PersonService))
        private personService: PersonService,
        private jwtService: JwtService
    ) {
        // const serviceAccount = JSON.parse(
        //     fs.readFileSync(
        //         path.join(process.cwd(), 'src/config/firebase/adminSdkCredential.json'),
        //         'utf-8'
        //     )
        // );

        const adminParams = {
            type: process.env.FIREBASE_TYPE,
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            clientId: process.env.FIREBASE_CLIENT_ID,
            authUri: process.env.FIREBASE_AUTH_URI,
            tokenUri: process.env.FIREBASE_TOKEN_URI,
            authProviderX509CertUrl: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            clientC509CertUrl: process.env.FIREBASE_CLIENT_X509_CER_URL,
            universeDomain: process.env.FIREBASE_UNIVERSE_DOMAIN,
        };
        this.defaultApp = admin.initializeApp({
            credential: admin.credential.cert(adminParams),
        });
    }

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

    getAdmin(): admin.app.App {
        return this.defaultApp;
    }
}
