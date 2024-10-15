import {
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
    PasswordUpdateRequestDto,
    PersonUpdateDto,
    UpdateFcmTokenRequestDto,
} from './dto/person.dto';
import { NotificationService } from '../notification/notification.service';
import { AdminCreateUserRequest, MobileSignUpRequest } from '../auth/dto/sign-up-request.dto';

export type User = any;

@Injectable()
export class PersonService {
    constructor(
        @InjectModel(Person.name) private readonly model: Model<PersonDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService
    ) {}

    async getLastOdooCustomerId() {
        const lastOdooCustomerId = await this.model
            .findOne({ odooCustomerId: { $ne: null } })
            .sort({ odooCustomerId: -1 })
            .exec();
        return lastOdooCustomerId ? Number(lastOdooCustomerId?.odooCustomerId) + 1 : 1;
    }

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: MobileSignUpRequest | AdminCreateUserRequest) {
        return await this.model.create(data);
    }

    async findOne(id: string) {
        return await this.model.findById(id).exec();
    }

    async findByQuery(query: {}) {
        return await this.model
          .find(query)
          .select('-password')
          .exec();
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
        // query['deletedAt'] = { $eq: null };
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
            return this.model
                .findById(id)
                .populate(
                    withPopulate
                        ? ['role', { path: 'role', populate: { path: 'permissions' } }]
                        : []
                )
                .exec();
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

    async updateFcmToken(id: string, data: UpdateFcmTokenRequestDto) {
        const person = await this.model.findById(id).exec();
        if (!person) return;

        let channel: string;
        if (process.env.NODE_ENVIRONMENT === 'production') channel = 'news';
        else channel = 'news-staging';

        await this.notificationService.subscribedToNotificationChannel(data.fcmToken, channel);
        if (person.fcmTokens && person.fcmTokens.length > 0) {
            const foundElements = person.fcmTokens.find((value) => value == data.fcmToken);
            if (!foundElements) {
                if (person.fcmTokens.length >= 10) person.fcmTokens.shift();
                person.fcmTokens.push(data.fcmToken);
            }
        } else person.fcmTokens = [data.fcmToken];
        await person.save();

        return person;
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
            return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    async revokeRoleFromPersonsIdsArray(personIds: any) {
        try {
            return await this.model.updateMany(
              { _id: { $in: personIds } },
              { $set: { role: null } }
            );
        } catch (error) {
            console.error('Error setting role to null:', error);
        }
    }
}
