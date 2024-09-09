import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  NotificationCreateDto,
  NotificationPayload,
} from './dto/notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Notification,
  NotificationDocument,
} from '../notification/schema/notification.schema';
import { Model } from 'mongoose';
import { PersonService } from '../person/person.service';
import * as mongoose from 'mongoose';
// import { FIREBASE_PROVIDER } from 'src/utils/const';

@Injectable()
export class NotificationService {
  private readonly admin;

  constructor(
    @InjectModel(Notification.name)
    private readonly model: Model<NotificationDocument>,
    // @Inject(FIREBASE_PROVIDER) private readonly firebase,
    @Inject(forwardRef(() => PersonService))
    private readonly personService: PersonService,
  ) {
    // this.admin = this.firebase;
  }

  /*******************************************************************
   * create
   ******************************************************************/
  async create(createNotificationDto: NotificationCreateDto) {
    try {
      return await this.model.create(createNotificationDto);
    } catch (e) {
      console.log('Error while creating notification: ', e);
      throw new InternalServerErrorException();
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
      return await this.model
        .find(query)
        .populate('user')
        .sort({ createdAt: -1 })
        .exec();
    } catch (e) {
      console.log('Error while getting notifications: ', e);
      throw new InternalServerErrorException();
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
      await this.admin.messaging().subscribeToTopic(fcmToken, channel);

      console.log('SubscribeToTopic successfully');
      return {
        status: HttpStatus.OK,
        message: 'subscribeToTopic successfully',
      };
    } catch (e) {
      console.log('Error in subscribeToTopic: ', e);
    }
  }

  /*******************************************************************
   * sendNotificationToChannel
   ******************************************************************/
  async sendNotificationToChannel(channel: string, data: NotificationPayload) {
    try {
      await this.admin.messaging().send({
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
      console.log('Error while sending sendNotificationToChannel: ', e);
    }
  }

  /*******************************************************************
   * sendNotificationToSingleDevice
   ******************************************************************/
  async sendNotificationFromApiToSingleDevice(
    fcmToken,
    data: NotificationPayload,
  ) {
    const person = await this.personService.findOneByFcmToken(fcmToken);

    if (!person)
      throw new NotFoundException('No user associate with the given token!');

    const user = person[0]._id.toString();
    const { title, body } = data;
    await this.sendNotificationToSingleDevice(
      title,
      body,
      user,
      [fcmToken],
      true,
    );

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
    data: any = null,
  ) {
    console.log('data: ', data);
    try {
      for (const token of tokens) {
        await this.admin.messaging().send({
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
      console.log('Error while sending sendNotificationToSingleDevice: ', e);
    }
  }

  /*******************************************************************
   * sendNotificationToMultipleDevices
   ******************************************************************/
  async sendNotificationToMultipleDevices(fcmTokens, title, body) {
    try {
      for (let i = 0; i < fcmTokens.length; i++) {
        const payload = {
          notification: {
            title,
            body,
          },
          token: fcmTokens[i],
        };
        await this.admin.messaging().send(payload);
      }

      return {
        status: HttpStatus.OK,
        message: 'Multiple Notifications sent successfully',
      };
    } catch (e) {
      console.log('Error while sending Multiple Notifications: ', e);
    }
  }

  /*******************************************************************
   * sendNotificationByUserId
   ******************************************************************/
  async sendNotificationByUserId(personId: string, title, body) {
    const person = await this.personService.findOne(personId);
    if (!person || (person && !person.fcmTokens)) return;

    await this.sendNotificationToSingleDevice(
      title,
      body,
      personId,
      person.fcmTokens,
      true,
    );
  }
}
