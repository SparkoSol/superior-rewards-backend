import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlDocument } from './schema/user-gift-ttl.schema';
import { Model } from 'mongoose';
import { UserGiftTtlCreateRequest } from './dto/user-gift-ttl.dto';
import { UserGiftService } from '../user-gift/user-gift.service';
import { NotificationService } from '../notification/notification.service';
import { UserGiftStatus } from '../user-gift/enum/status.enum';
import { PersonService } from '../person/person.service';
import { TransactionService } from '../transaction/transaction.service';
import { SettingService } from '../settings/setting.service';
import { TransactionType } from '../transaction/enum/type.enum';

@Injectable()
export class UserGiftTtlService implements OnModuleInit {
    private changeStreamInitialized = false; // Track whether change stream has been initialized

    constructor(
        @InjectModel(UserGiftTtl.name) private readonly model: Model<UserGiftTtlDocument>,
        @Inject(forwardRef(() => UserGiftService))
        private readonly UserGiftService: UserGiftService,
        private readonly personService: PersonService,
        private readonly notificationService: NotificationService,
        private readonly transactionService: TransactionService,
        private readonly settingService: SettingService,
    ) {}

    async onModuleInit() {
        if (!this.changeStreamInitialized) {
            this.startChangeStream();
            this.changeStreamInitialized = true; // Ensure change stream is only initialized once
        } else {
            Logger.debug('Change stream already Initialized');
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

        let lastPromise = Promise.resolve(); // Tracks the last processed promise

        changeStream.on('change', (change) => {
            const userGiftId = change.documentKey._id;

            // Chain the next task to the lastPromise
            lastPromise = lastPromise
                .then(async () => {
                    const userGift = (await this.UserGiftService.fetchById(
                        userGiftId,
                        true
                    )) as any;
                    const giftUser = userGift.user;
                    const settings = await this.settingService.fetch();

                    if (
                        userGift &&
                        userGift.status === UserGiftStatus.PENDING &&
                        !userGift.isExpired
                    ) {
                        Logger.debug(`UserGift: ${userGiftId} is expired`);

                        await this.UserGiftService.update(userGiftId, { isExpired: true });

                        // Update user, increase points, and decrease redeemed points
                        try {
                            await this.personService.update(giftUser._id, {
                                points: Number(giftUser.points) + Number(userGift.totalPoints),
                                redeemedPoints:
                                    Number(giftUser.redeemedPoints) - Number(userGift.totalPoints),
                            });
                        } catch (error) {
                            Logger.error(
                                `Error while updating user in user-gifts-ttl change stream: ${error}`
                            );
                        }

                        // create CREDIT type transaction, REFUNDED by system
                        try {
                            await this.transactionService.create({
                                user: giftUser._id,
                                customerPhone: giftUser.phone,
                                points: userGift.totalPoints,
                                amount: settings.points ? userGift.totalPoints / settings.points : null,
                                type: TransactionType.CREDIT,
                                details: 'REFUNDED ON EXPIRATION'
                            });
                        } catch (error) {
                            Logger.error(`Error while creating revert transaction in userGiftTtl: ${error}`);
                        }

                        // Send notification when a gift has expired
                        try {
                            await this.notificationService.sendNotificationToSingleDevice(
                                'Oops! Your gift has expired',
                                `Your redemption has expired. Better luck next time.`,
                                userGift.user._id.toString(),
                                userGift.user.fcmTokens
                            );
                        } catch (e) {
                            Logger.error(
                                `Error while sending notification when a gift has expired: ${e}`
                            );
                        }
                    }
                })
                .catch((error) => {
                    Logger.error(`Error while processing change stream task: ${error}`);
                });
        });

        changeStream.on('error', (err) => {
            Logger.error(`Change stream error :: ${err}`);
        });
    }

    ////////////////////////////////////////////////////////////
    /// SAME SOLUTION WITH CUSTOM QUEUE ///////////////////////
    ///////////////////////////////////////////////////////////

    // private startChangeStream() {
    //     // Watch only for delete operations on the UserGift collection
    //     const changeStream = this.model.watch([{ $match: { operationType: 'delete' } }]);
    //     const taskQueue: (() => Promise<void>)[] = [];
    //     let isProcessing = false;
    //
    //     const processQueue = async () => {
    //         if (isProcessing || taskQueue.length === 0) return;
    //         isProcessing = true;
    //
    //         while (taskQueue.length > 0) {
    //             const task = taskQueue.shift();
    //             if (task) {
    //                 try {
    //                     await task();
    //                 } catch (error) {
    //                     Logger.error(`Error processing task in queue: ${error}`);
    //                 }
    //             }
    //         }
    //
    //         isProcessing = false;
    //     };
    //
    //     changeStream.on('change', (change) => {
    //         const userGiftId = change.documentKey._id;
    //
    //         taskQueue.push(async () => {
    //             const userGift = (await this.UserGiftService.fetchById(userGiftId, true)) as any;
    //             const giftUser = userGift.user;
    //
    //             if (userGift && userGift.status === UserGiftStatus.PENDING && !userGift.isExpired) {
    //                 Logger.debug(`UserGift: ${userGiftId} is expired`);
    //
    //                 await this.UserGiftService.update(userGiftId, { isExpired: true });
    //
    //                 // Update user, increase points, and decrease redeemed points
    //                 try {
    //                     let user = await this.personService.fetchById(giftUser._id);
    //                     console.log(
    //                       `before users points update ${change.documentKey._id}: `,
    //                       user.points
    //                     );
    //                     await this.personService.update(giftUser._id, {
    //                         points: Number(giftUser.points) + Number(userGift.totalPoints),
    //                         redeemedPoints:
    //                           Number(giftUser.redeemedPoints) - Number(userGift.totalPoints),
    //                     });
    //                     user = await this.personService.fetchById(giftUser._id);
    //                     console.log(
    //                       `after users points update ${change.documentKey._id}: `,
    //                       user.points
    //                     );
    //                 } catch (error) {
    //                     Logger.error(
    //                       `Error while updating user in user-gifts-ttl change stream: ${error}`
    //                     );
    //                 }
    //
    //                 // Send notification when a gift has expired
    //                 try {
    //                     await this.notificationService.sendNotificationToSingleDevice(
    //                       'Oops! Your gift has expired',
    //                       `Your redemption has expired. Better luck next time.`,
    //                       userGift.user._id.toString(),
    //                       userGift.user.fcmTokens
    //                     );
    //                 } catch (e) {
    //                     Logger.error(
    //                       `Error while sending notification when a gift has expired: ${e}`
    //                     );
    //                 }
    //             }
    //         });
    //
    //         processQueue();
    //     });
    //
    //     changeStream.on('error', (err) => {
    //         Logger.error(`Change stream error :: ${err}`);
    //     });
    // }

    ////////////////////////////////////////////////////////////
    /// SAME SOLUTION DEPENDENCY ////////////////////////////
    ///////////////////////////////////////////////////////////
    // private startChangeStream() {
    //     // Watch only for delete operations on the UserGift collection
    //     const changeStream = this.model.watch([{ $match: { operationType: 'delete' } }]);
    //
    //     changeStream.on('change', async (change) => {
    //         setTimeout(async () => {
    //             const userGiftId = change.documentKey._id;
    //             const userGift = (await this.UserGiftService.fetchById(userGiftId, true)) as any;
    //             const giftUser = userGift.user;
    //
    //             if (userGift && userGift.status === UserGiftStatus.PENDING && !userGift.isExpired) {
    //                 Logger.debug(`UserGift: ${userGiftId} is expired`);
    //
    //                 await this.UserGiftService.update(userGiftId, { isExpired: true });
    //
    //                 // Update user, increase points, and decrease redeemed points
    //                 try {
    //                     let user = await this.personService.fetchById(giftUser._id);
    //                     console.log(
    //                         `before users points update ${change.documentKey._id}: `,
    //                         user.points
    //                     );
    //                     await this.personService.update(giftUser._id, {
    //                         points: Number(giftUser.points) + Number(userGift.totalPoints),
    //                         redeemedPoints:
    //                             Number(giftUser.redeemedPoints) - Number(userGift.totalPoints),
    //                     });
    //                     user = await this.personService.fetchById(giftUser._id);
    //                     console.log(
    //                         `after users points update ${change.documentKey._id}: `,
    //                         user.points
    //                     );
    //                 } catch (error) {
    //                     Logger.error(
    //                         `Error while updating user in user-gifts-ttl change stream: ${error}`
    //                     );
    //                 }
    //
    //                 // Send notification when a gift has expired
    //                 try {
    //                     await this.notificationService.sendNotificationToSingleDevice(
    //                         'Oops! Your gift has expired',
    //                         `Your redemption has expired. Better luck next time.`,
    //                         userGift.user._id.toString(),
    //                         userGift.user.fcmTokens
    //                     );
    //                 } catch (e) {
    //                     Logger.error(
    //                         `Error while sending notification when a gift has expired: ${e}`
    //                     );
    //                 }
    //             }
    //         }, 500);
    //
    //         console.log('timeout');
    //     });
    //
    //     changeStream.on('error', (err) => {
    //         Logger.error(`Change stream error :: ${err}`);
    //     });
    // }
}
