import {
    forwardRef,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException, Logger,
    NotFoundException,
} from '@nestjs/common';
import { NotificationCreateDto, NotificationPayload } from './dto/notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from '../notification/schema/notification.schema';
import * as mongoose from 'mongoose';
import { Model } from 'mongoose';
import { PersonService } from '../person/person.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private readonly model: Model<NotificationDocument>,
        @Inject(forwardRef(() => PersonService)) private readonly personService: PersonService,
        @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService
    ) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(createNotificationDto: NotificationCreateDto) {
        try {
            return await this.model.create(createNotificationDto);
        } catch (e) {
            throw new InternalServerErrorException(`Error while creating notification: ${e}`);
        }
    }

    /*******************************************************************
     * findAll
     ******************************************************************/
    async findAll(user?: string, markAsRead?: boolean) {
        try {
            const query = {};
            if (user) query['user'] = new mongoose.Types.ObjectId(user);
            if (markAsRead) query['markAsRead'] = markAsRead;
            return await this.model.find(query).populate('user').sort({ createdAt: -1 }).exec();
        } catch (e) {
            throw new InternalServerErrorException(`Error while getting notifications: ${e}`);
        }
    }

    /*******************************************************************
     * findOne
     ******************************************************************/
    async findOne(id: string) {
        try {
            return await this.model.findById(id).populate('user').exec();
        } catch (e) {
            throw new NotFoundException('What You Are Looking For Not Found');
        }
    }

    /*******************************************************************
     * subscribedToNotificationChannel
     ******************************************************************/
    async subscribedToNotificationChannel(fcmToken: string, channel: string) {
        try {
            const admin = this.authService.getAdmin();
            await admin.messaging().subscribeToTopic(fcmToken, channel);

            return {
                status: HttpStatus.OK,
                message: 'subscribeToTopic successfully',
            };
        } catch (e) {
            Logger.error(`Error in subscribeToTopic: ${e}`);
        }
    }

    /*******************************************************************
     * sendNotificationToChannel
     ******************************************************************/
    async sendNotificationToChannel(channel: string, data: NotificationPayload) {
        try {
            const admin = this.authService.getAdmin();
            await admin.messaging().send({
                notification: {
                    title: data.title,
                    body: data.body,
                },
                topic: channel,
            });

            return {
                status: HttpStatus.OK,
                message: 'Notification sent successfully',
            };
        } catch (e) {
            Logger.error(`Error in sendNotificationToChannel: ${e}`);
        }
    }

    /*******************************************************************
     * sendNotificationToSingleDevice
     ******************************************************************/
    async sendNotificationFromApiToSingleDevice(fcmToken: string, data: NotificationPayload) {
        const person = await this.personService.findOneByFcmToken(fcmToken);

        if (!person) throw new NotFoundException('No user associate with the given token!');

        const user = person._id.toString();
        const { title, body } = data;
        await this.sendNotificationToSingleDevice(title, body, user, [fcmToken], true);

        return {
            status: HttpStatus.OK,
            message: 'Notification sent successfully',
        };
    }

    async sendNotificationToSingleDevice(
        title: string,
        body: string,
        user: string,
        tokens: string[],
        save = true,
        data: any = null
    ) {
        try {
            for (const token of tokens) {
                const admin = this.authService.getAdmin();
                await admin.messaging().send({
                    notification: {
                        title: title ?? 'Notification Title from Backend',
                        body: body ?? 'Notification Body from Backend',
                    },
                    token: token,
                });
            }

            if (save) {
                await this.create({
                    title,
                    body,
                    user,
                    markAsRead: false,
                    imageUrl: '',
                });
            }

            return {
                status: HttpStatus.OK,
                message: 'Notification sent successfully',
            };
        } catch (e) {
            Logger.error(`Error while sending sendNotificationToSingleDevice: ${e}`);
        }
    }

    /*******************************************************************
     * sendNotificationToMultipleDevices
     ******************************************************************/
    async sendNotificationToMultipleDevices(fcmTokens: any, title: string, body: string) {
        try {
            for (let i = 0; i < fcmTokens.length; i++) {
                const payload = {
                    notification: {
                        title,
                        body,
                    },
                    token: fcmTokens[i],
                };
                const admin = this.authService.getAdmin();
                await admin.messaging().send(payload);
            }

            return {
                status: HttpStatus.OK,
                message: 'Multiple Notifications sent successfully',
            };
        } catch (e) {
            Logger.error(`Error while sending Multiple Notifications: ${e}`);
        }
    }

    /*******************************************************************
     * sendNotificationByUserId
     ******************************************************************/
    async sendNotificationByUserId(personId: string, title: string, body: string) {
        const person = await this.personService.findOne(personId);
        if (!person || (person && !person.fcmTokens)) return;

        await this.sendNotificationToSingleDevice(title, body, personId, person.fcmTokens, true);
    }
}
