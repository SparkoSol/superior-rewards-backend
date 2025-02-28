import {
    ConflictException,
    forwardRef,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
} from '@nestjs/common';
import { PersonService } from '../person/person.service';
import { JwtService } from '@nestjs/jwt';
import { AdminCreateUserRequest, MobileSignUpRequest } from './dto/sign-up-request.dto';
import * as mongoose from 'mongoose';
import * as admin from 'firebase-admin';
import * as process from 'process';
import { RoleService } from '../role/role.service';
import { SignOutRequest } from './dto/sign-in-request.dto';

@Injectable()
export class AuthService {
    private readonly defaultApp: any;

    constructor(
        @Inject(forwardRef(() => PersonService))
        private personService: PersonService,
        private jwtService: JwtService,
        private readonly roleService: RoleService
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
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
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

        if (person && person.deletedAt) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: 'Account Deleted by Super Admin!',
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

    async isUserExist(phone: string) {
        const query = {};
        query['phone'] = phone;
        query['deletedAt'] = { $eq: null };
        return !!(await this.personService.findOneByQuery(query));
    }

    getRoleWithPermissions(role: any) {
        return {
            name: role.name,
            permissions: role.permissions.map((permission: any) => permission.name),
        };
    }

    /*******************************************************************
     * adminSignUp
     ******************************************************************/
    async adminSignUp(data: AdminCreateUserRequest) {
        if (await this.isUserExist(data.phone)) {
            throw new NotAcceptableException('User with this phone already exist.');
        }

        try {
            data.session = new Date();
            const person = await this.personService.create(data);

            return {
                accessToken: this.jwtService.sign({
                    _id: person._id,
                    phone: person.phone,
                    role: data.role,
                }),
            };
        } catch (e) {
            Logger.error(`Error while adminSignUp: ${e}`);
            throw new InternalServerErrorException('Error while adminSignUp: ', e);
        }
    }

    /*******************************************************************
     * signUp
     ******************************************************************/
    async signUp(data: MobileSignUpRequest) {
        const role = await this.roleService.fetchByRoleName('User');

        if (await this.isUserExist(data.phone)) {
            throw new NotAcceptableException('User with this phone already exist.');
        }

        if (!role) {
            throw new NotAcceptableException(
                'Invalid role, please contact admin to add User role.'
            );
        }

        data.role = role._id.toString();

        if (data.odooCustomerId) {
            const customer = await this.personService.findOneByQuery({
                odooCustomerId: data.odooCustomerId,
            });
            if (customer)
                throw new ConflictException(
                  'Customer with the same customer number already exist in system!'
                );
        } else {
            data.odooCustomerId = await this.personService.getLastOdooCustomerId();
        }

        data.session = new Date();

        try {
            const person = await this.personService.create(data);
            return {
                accessToken: this.jwtService.sign({
                    _id: person._id,
                    phone: person.phone,
                    role: role._id.toString(),
                }),
            };
        } catch (e) {
            Logger.error(`Error while signup :: ${e}`);
            throw new InternalServerErrorException('Error while signup: ', e);
        }
    }

    /*******************************************************************
     * signIn
     ******************************************************************/
    async signIn(person: any) {
        await this.personService.update(person._id.toString(), {session: new Date()});
        return {
            accessToken: this.jwtService.sign({
                _id: person._id,
                phone: person.phone,
                role: person.role,
            }),
        };
    }

    /*******************************************************************
     * signOut
     ******************************************************************/
    async signOut(person: any, data: SignOutRequest) {
        return await this.personService.removeFcmToken(person._id.toString(), data.fcmToken);
    }

    /*******************************************************************
     * getProfile
     ******************************************************************/
    async getProfile(user: any, withPopulate: boolean = false) {
        const profile = (await this.personService.findOneByQuery(
            {
                _id: new mongoose.Types.ObjectId(user.userId),
                phone: user.phone,
            },
            withPopulate
        )) as any;

        if (withPopulate) {
            return {
                ...profile._doc,
                role: profile.role ? this.getRoleWithPermissions(profile.role) : null,
            };
        }

        return profile;
    }

    getAdmin(): admin.app.App {
        return this.defaultApp;
    }
}
