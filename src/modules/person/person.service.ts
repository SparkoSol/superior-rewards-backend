import {
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PasswordUpdateRequestDto, PersonUpdateDto } from './dto/person.dto';
import { AdminCreateUserRequest, MobileSignUpRequest } from '../auth/dto/sign-up-request.dto';

export type User = any;

@Injectable()
export class PersonService {
    constructor(@InjectModel(Person.name) private readonly model: Model<PersonDocument>) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: MobileSignUpRequest | AdminCreateUserRequest) {
        return await this.model.create(data);
    }

    async findOne(id: string) {
        return await this.model.findById(id).exec();
    }

    async findOneByQuery(query: {}, withPopulate?: boolean) {
        return await this.model
            .findOne(query)
            .select('-password')
            .populate(
                withPopulate
                    ? [
                          'role',
                          {
                              path: 'role',
                              populate: { path: 'permissions' },
                          },
                      ]
                    : []
            )
            .exec();
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
    async fetch(withPopulate?: boolean) {
        const query = {};
        query['deletedAt'] = { $eq: null };
        return this.model
            .find(query)
            .populate(
                withPopulate
                    ? [
                          'role',
                          {
                              path: 'role',
                              populate: { path: 'permissions' },
                          },
                      ]
                    : []
            )
            .sort({ createdAt: -1 })
            .exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string, withPopulate?: boolean): Promise<PersonDocument> {
        try {
            return this.model.findById(id).populate(
              withPopulate ? ['role', { path: 'role', populate: { path: 'permissions' } }] : []
            ).exec();
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
