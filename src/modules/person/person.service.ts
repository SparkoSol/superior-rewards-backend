import {
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpRequest } from '../auth/dto/sign-up-request.dto';
import { PasswordUpdateRequestDto, PersonUpdateDto } from './dto/person.dto';

export type User = any;

@Injectable()
export class PersonService {
    private readonly users = [
        {
            userId: 1,
            username: 'john',
            password: 'changeme',
        },
        {
            userId: 2,
            username: 'maria',
            password: 'guess',
        },
    ];

    constructor(@InjectModel(Person.name) private readonly model: Model<PersonDocument>) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: SignUpRequest) {
        const person = (await this.model.create({
            ...data,
        })) as PersonDocument;

        return this.model.findById(person._id);
    }

    async findOne(id: string) {
        return await this.model.findById(id).exec();
    }

    async findOneByQuery(query: {}) {
        return await this.model.findOne(query).select('-password').exec();
    }

    async findOneByFcmToken(fcmToken: string) {
        return this.model.findOne({ fcmTokens: { $in: [fcmToken] } });
    }

    async findOneByPhone(phone: string): Promise<User | undefined> {
        return this.model.findOne({ phone }).exec();
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch() {
        return this.model.find().sort({ createdAt: -1 }).exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string): Promise<PersonDocument> {
        try {
            return this.model.findById(id).exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * changePassword
     ******************************************************************/
    async changePassword(data: PasswordUpdateRequestDto) {
        const person = await this.findOne(data.person);
        if (person && data.oldPassword === person.password) {
            return this.model.findOneAndUpdate(
                { _id: person._id },
                {
                    password: data.newPassword,
                },
                {
                    new: true,
                }
            );
        } else {
            throw new NotAcceptableException('Old Password Not Correct!');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, data: PersonUpdateDto) {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    async delete(id: string) {
        try {
            return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }
}
