import {
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGift, UserGiftDocument } from './schema/user-gift.schema';
import mongoose, { Model } from 'mongoose';
import {
    UserGiftCreateRequest,
    UserGiftFiltersDto,
    UserGiftPostQrCodeRequest,
    UserGiftRedeemedRequest,
    UserGiftUpdateRequest,
} from './dto/user-gift.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/enum/type.enum';
import { PersonService } from '../person/person.service';
import { UserGiftStatus } from './enum/status.enum';
import { NoGeneratorUtils } from '../../utils/no-generator-utils';
import { UserGiftTtlService } from '../user-gift-ttl/user-gift-ttl.service';
import { SettingService } from '../settings/setting.service';
import { NotificationService } from '../notification/notification.service';
import { helper } from '../../utils/helper';
import * as process from 'process';
import { MongoQueryUtils } from '../../utils/mongo-query-utils';

@Injectable()
export class UserGiftService {
    constructor(
        @InjectModel(UserGift.name) private readonly model: Model<UserGiftDocument>,
        private readonly personService: PersonService,
        private readonly transactionService: TransactionService,
        @Inject(forwardRef(() => UserGiftTtlService))
        private readonly UserGiftTtlService: UserGiftTtlService,
        private readonly SettingService: SettingService,
        private readonly notificationService: NotificationService
    ) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: UserGiftCreateRequest) {
        const person = (await this.personService.findOne(data.user)) as any;
        if (!person) throw new NotAcceptableException('Invalid user id!');

        data['qrCode'] = await NoGeneratorUtils.generateCode();

        if (data.totalPoints > person.points) {
            throw new NotAcceptableException('Insufficient points!');
        }

        const userGift = await this.model.create(data);
        const settings = await this.SettingService.fetch();

        // create entry in user-gift-ttl
        await this.UserGiftTtlService.create({
            _id: userGift._id.toString(),
            expireAt: helper.addCustomDelay(
                new Date(new Date().toISOString().replace('Z', '+00:00')),
                Number(process.env.REDEEMED_GIFT_EXPIRES) // 10
            ),
        });

        // create DEBIT type transaction, when user redeemed a gift
        try {
            await this.transactionService.create({
                user: data.user,
                customerPhone: person.phone,
                points: data.totalPoints,
                amount: settings.points ? data.totalPoints / settings.points : null,
                type: TransactionType.DEBIT,
                performedBy: data.redeemedBy,
            });
        } catch (error) {
            Logger.error(`Error while creating transaction for redeeming gift: ${error}`);
        }

        // update user, decrease points and increase redeemed points
        try {
            await this.personService.update(data.user, {
                points: Number(person.points) - Number(data.totalPoints),
                redeemedPoints: Number(person.redeemedPoints) + Number(data.totalPoints),
            });
        } catch (error) {
            Logger.error(
                `Error while updating user points and redeemed points after redeeming gift in user-gifts create: ${error}`
            );
        }

        // send notification to user You have redeemed a gift.
        try {
            await this.notificationService.sendNotificationToSingleDevice(
                'Congrats! You have redeem a gift.',
                `You have received ${data.totalPoints} points gift.`,
                person._id,
                person.fcmTokens
            );
        } catch (e) {
            Logger.error(`Error while sending notification to user after redeeming gift: ${e}`);
        }

        return userGift;
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    async filters(data: UserGiftFiltersDto) {
        const { page, pageSize, user, status, filters, populated, withPopulate } = data;
        const query = [];

        if (filters) {
            query.push({ $match: MongoQueryUtils.getQueryFromFilters(filters) });
        }

        // Apply specific match conditions if user or gift is provided
        if (user) {
            query.push({
                $match: {
                    user: new mongoose.Types.ObjectId(user),
                },
            });
        }
        if (status) {
            query.push({
                $match: {
                    status: status,
                },
            });
        }

        // Add lookups for populating user and gift collections if needed
        if (withPopulate) {
            query.push(
                {
                    $lookup: {
                        from: 'people',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'people',
                        localField: 'performedBy',
                        foreignField: '_id',
                        as: 'performedBy',
                    },
                },
                {
                    $unwind: {
                        path: '$performedBy',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'people',
                        localField: 'redeemedBy',
                        foreignField: '_id',
                        as: 'redeemedBy',
                    },
                },
                {
                    $unwind: {
                        path: '$redeemedBy',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'gifts',
                        localField: 'gifts',
                        foreignField: '_id',
                        as: 'giftsDetails',
                    },
                },
                {
                    $set: {
                        gifts: {
                            $map: {
                                input: '$gifts',
                                as: 'giftId',
                                in: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: '$giftsDetails',
                                                as: 'gift',
                                                cond: { $eq: ['$$gift._id', '$$giftId'] },
                                            },
                                        },
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $unset: 'giftsDetails',
                }
            );

            if (populated) {
                const populatedMatchStages = MongoQueryUtils.createDynamicMatchStages(populated);
                query.push(...populatedMatchStages);
            }
        }

        // Get total count for pagination
        const totalCountPipeline = [...query, { $count: 'totalCount' }];
        const totalCountResult = await this.model.aggregate(totalCountPipeline).exec();
        const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

        // Apply pagination
        query.push(
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
        );

        // Execute the main query
        const histories = await this.model.aggregate(query).exec();

        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: histories,
            page,
            pageSize: histories.length,
            totalPages,
            filters,
        };
    }

    /*******************************************************************
     * redeem
     ******************************************************************/
    async redeem(data: UserGiftRedeemedRequest) {
        const userGift = (await this.model
            .findById(data.userGiftId)
            .populate(['user', 'gifts'])
            .exec()) as any;
        if (!userGift) throw new NotAcceptableException('Invalid id!');

        if (userGift && userGift.isExpired) throw new NotAcceptableException('Gift is expired!');

        if (userGift && userGift.status === UserGiftStatus.REDEEMED)
            throw new NotAcceptableException('Gift is already redeemed!');

        const history = this.model.findByIdAndUpdate(
            userGift._id,
            {
                status: UserGiftStatus.REDEEMED,
                performedBy: data.performedBy,
            },
            { new: true }
        );

        // send notification When a user collects a gift.
        try {
            await this.notificationService.sendNotificationToSingleDevice(
                'Congrats! You have Collect a gift.',
                `You have collected your gift.`,
                userGift.user._id.toString(),
                userGift.user.fcmTokens
            );
        } catch (e) {
            Logger.error(`Error while sending notification When a user collects a gift: ${e}`);
        }

        return history;
    }

    /*******************************************************************
     * postQrCode
     ******************************************************************/
    async postQrCode(data: UserGiftPostQrCodeRequest) {
        const userGift = (await this.model
            .findOne({ qrCode: data.qrCode })
            .populate(['user'])
            .exec()) as any;
        if (!userGift) throw new NotAcceptableException('Invalid qrCode!');

        if (userGift && userGift.isExpired) throw new NotAcceptableException('Gift is expired!');

        if (userGift && userGift.status === UserGiftStatus.REDEEMED)
            throw new NotAcceptableException('Gift is already redeemed!');

        const history = this.model.findByIdAndUpdate(
            userGift._id,
            {
                status: UserGiftStatus.REDEEMED,
                performedBy: data.performedBy,
            },
            { new: true }
        );

        // send notification When a user collects a gift.
        try {
            await this.notificationService.sendNotificationToSingleDevice(
                'Congrats! You have Collect a gift.',
                `You have collected your gift.`,
                userGift.user._id.toString(),
                userGift.user.fcmTokens
            );
        } catch (e) {
            Logger.error(`Error while sending notification When a user collects a gift: ${e}`);
        }

        return history;
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(user?: string, status?: UserGiftStatus, withPopulate?: boolean) {
        const query = {};
        if (user) query['user'] = new mongoose.Types.ObjectId(user);
        if (status) query['status'] = status;
        const histories = (await this.model
            .find(query)
            .populate(withPopulate ? ['user', 'gifts'] : [])
            .sort({ createdAt: -1 })
            .exec()) as any;

        const allTtlItems = await this.UserGiftTtlService.fetch();

        return histories.map((item: any) => {
            const itemTtl = allTtlItems.find(
                (ttlItem) => ttlItem._id.toString() === item._id.toString()
            );

            return {
                ...item._doc,
                diffInSeconds: helper.getDifferenceInSeconds(
                    item.isExpired,
                    new Date().toString(),
                    item.status === UserGiftStatus.REDEEMED
                        ? null
                        : itemTtl
                          ? itemTtl.expireAt.toString()
                          : null
                ),
            };
        });
    }

    /*******************************************************************
     * fetchAllGiftByUser
     ******************************************************************/
    // async fetchAllGiftByUser(user: string, withPopulate?: boolean) {
    //     const [allGifts, userHistory] = await Promise.all([
    //         this.giftService.fetch(),
    //         this.fetch(user, null, withPopulate),
    //     ]);
    //
    //     return allGifts.map((gift: any) => ({
    //         ...gift._doc,
    //         userHistory: userHistory.find(
    //             (history) => history.gift.toString() === gift._id.toString()
    //         ),
    //     }));
    // }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string, withPopulate?: boolean): Promise<UserGiftDocument> {
        try {
            return this.model
                .findById(id)
                .populate(withPopulate ? ['user', 'gifts'] : [])
                .exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, data: UserGiftUpdateRequest) {
        if (data.status === UserGiftStatus.REDEEMED) {
            // remove entry from user-gift-ttl
            await this.UserGiftTtlService.deleteById(id);
        }

        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    // async delete(id: string) {
    //     try {
    //         return await this.model.findByIdAndDelete(id);
    //     } catch (e) {
    //         throw new InternalServerErrorException('Unexpected Error');
    //     }
    // }

    async getExpiredUserGiftsIds(excludedIds: any[]) {
        const items = await this.model.find({
            _id: { $nin: excludedIds },
            status: UserGiftStatus.PENDING,
            isExpired: false,
        });

        return items.map((item) => item._id);
    }

    async updateStatusOfExpiredUserGifts(ids: any[]) {
        const redemptionsHistories = await this.model.find({ _id: { $in: ids } }).exec();

        if (redemptionsHistories.length > 0) {
            for (const history of redemptionsHistories) {
                const userGift = history as any;
                const giftUser = await this.personService.fetchById(userGift.user);
                const settings = await this.SettingService.fetch();

                // update user, increase points and decrease redeemed points
                try {
                    await this.personService.update(giftUser._id.toString(), {
                        points: Number(giftUser.points) + Number(userGift.totalPoints),
                        redeemedPoints:
                            Number(giftUser.redeemedPoints) - Number(userGift.totalPoints),
                    });
                } catch (error) {
                    Logger.error(
                        `Error while updating user points and redeemed points in updateStatusOfExpiredUserGifts: ${error}`
                    );
                }
                // create CREDIT type transaction, details: 'REFUNDED by system'
                try {
                    await this.transactionService.create({
                        user: giftUser._id.toString(),
                        customerPhone: giftUser.phone,
                        points: userGift.totalPoints,
                        amount: settings.points ? userGift.totalPoints / settings.points : null,
                        type: TransactionType.CREDIT,
                        details: 'Refund on gift expiry'
                    });
                } catch (error) {
                    Logger.error(`Error while creating revert transaction in userGift: ${error}`);
                }

            }
        }

        return this.model.updateMany({ _id: { $in: ids } }, { $set: { isExpired: true } });
    }
}
