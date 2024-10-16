import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlDocument } from './schema/user-gift-ttl.schema';
import { Model } from 'mongoose';
import { UserGiftTtlCreateRequest } from './dto/user-gift-ttl.dto';
import { UserGiftService } from '../user-gift/user-gift.service';
import { NotificationService } from '../notification/notification.service';
import { UserGiftStatus } from '../user-gift/enum/status.enum';

@Injectable()
export class UserGiftTtlService implements OnModuleInit {
  private changeStreamInitialized = false; // Track whether change stream has been initialized

  constructor(
    @InjectModel(UserGiftTtl.name) private readonly model: Model<UserGiftTtlDocument>,
    @Inject(forwardRef(() => UserGiftService))
    private readonly UserGiftService: UserGiftService,
    private readonly notificationService: NotificationService,
  ) {
  }

  async onModuleInit() {
    if (!this.changeStreamInitialized) {
      this.startChangeStream();
      this.changeStreamInitialized = true; // Ensure change stream is only initialized once
    } else {
      console.log('Change stream already Initialized');
    }
  }

  /*******************************************************************
   * create
   ******************************************************************/
  async create(data: UserGiftTtlCreateRequest) {
    return await this.model.create(data);
  }

  async fetchById(id: string) {
    return await this.model.findById(id).exec();
  }

  async fetch() {
    return await this.model.find().exec();
  }

  async getAllReferenceIdsInArray() {
    const records = await this.model.find().exec();
    return records.map((record) => record._id);
  }

  async deleteById(userGiftTtlId: string) {
    return await this.model.findByIdAndDelete(userGiftTtlId).exec();
  }

  private startChangeStream() {
    // Watch only for delete operations on the UserGift collection
    const changeStream = this.model.watch([{ $match: { operationType: 'delete' } }]);

    changeStream.on('change', async (change) => {
      const userGiftId = change.documentKey._id;
      const userGift = await this.UserGiftService.fetchById(userGiftId, true) as any;

      if (userGift && userGift.status === UserGiftStatus.PENDING && !userGift.isExpired) {
        console.log(`Updated isExpired for UserGift: ${userGiftId} on ${new Date().toLocaleString()}`);

        // Reinsert the document with isExpired = true to prevent re-deletion;
        await this.UserGiftService.update(userGiftId, { isExpired: true });

        // send notification when a gift has expired.
        try {
          await this.notificationService.sendNotificationToSingleDevice(
            'Ops! Your gift has expired',
            `Your gift (${userGift.gift.name}) have been expired, better luck next time.`,
            userGift.user._id.toString(),
            userGift.user.fcmTokens,
          );
        } catch (e) {
          Logger.error(`Error while sending notification when a gift has expired. : ${e}`);
        }
      }

    });

    changeStream.on('error', (err) => {
      console.error('Change stream error:', err);
    });
  }
}
