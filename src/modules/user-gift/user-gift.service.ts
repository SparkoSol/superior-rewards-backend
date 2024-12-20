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
    UserGiftUpdateRequest,
} from './dto/user-gift.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/enum/type.enum';
import { PersonService } from '../person/person.service';
import { GiftService } from '../gift/gift.service';
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
        private readonly giftService: GiftService,
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

        const gift = await this.giftService.fetchById(data.gift);
        if (!gift) throw new NotAcceptableException('Invalid gift id!');

        if (person.points < gift.points) throw new NotAcceptableException('Insufficient points!');

        data['qrCode'] = await NoGeneratorUtils.generateCode();

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
                points: gift.points,
                amount: settings.points ? gift.points / settings.points : null,
                type: TransactionType.DEBIT,
            });
        } catch (error) {
            Logger.error(`Error while creating transaction for redeeming gift: ${error}`);
        }

        // Deduct git points from user current points
        try {
            await this.personService.update(data.user, {
                points: Number(person.points) - Number(gift.points),
            });
        } catch (error) {
            Logger.error(`Error while updating user points after redeeming gift: ${error}`);
        }

        // increase redeemedPoints
        try {
            await this.personService.update(data.user, {
                redeemedPoints: Number(person.redeemedPoints) + Number(gift.points),
            });
        } catch (error) {
            Logger.error(
                `Error while updating user redeemed points after redeeming gift: ${error}`
            );
        }

        // send notification to user You have redeem a gift.
        try {
            await this.notificationService.sendNotificationToSingleDevice(
                'Congrats! You have redeem a gift.',
                `You have received ${gift.points} points gift.`,
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
        const { page, pageSize, user, gift, status, filters, populated, withPopulate } = data;
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
        if (gift) {
            query.push({
                $match: {
                    gift: new mongoose.Types.ObjectId(gift),
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
                      from: 'gifts', // Replace 'gifts' with your actual gifts collection name
                      localField: 'gift',
                      foreignField: '_id',
                      as: 'gift',
                  },
              },
              {
                  $unwind: {
                      path: '$gift',
                      preserveNullAndEmptyArrays: true,
                  },
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
    async redeem(id: string) {
        const userGift = (await this.model
          .findById(id)
          .populate(['user', 'gift'])
          .exec()) as any;
        if (!userGift) throw new NotAcceptableException('Invalid id!');

        if (userGift && userGift.isExpired) throw new NotAcceptableException('Gift is expired!');

        if (userGift && userGift.status === UserGiftStatus.REDEEMED)
            throw new NotAcceptableException('Gift is already redeemed!');

        const history = this.model.findByIdAndUpdate(
          userGift._id,
          {
              status: UserGiftStatus.REDEEMED,
          },
          { new: true }
        );

        // send notification When a user collects a gift.
        try {
            await this.notificationService.sendNotificationToSingleDevice(
              'Congrats! You have Collect a gift.',
              `You have collected your gift (${userGift.gift.name}).`,
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
    async postQrCode(qrCode: string) {
        const userGift = (await this.model
            .findOne({ qrCode })
            .populate(['user', 'gift'])
            .exec()) as any;
        if (!userGift) throw new NotAcceptableException('Invalid qrCode!');

        if (userGift && userGift.isExpired) throw new NotAcceptableException('Gift is expired!');

        if (userGift && userGift.status === UserGiftStatus.REDEEMED)
            throw new NotAcceptableException('Gift is already redeemed!');

        const history = this.model.findByIdAndUpdate(
            userGift._id,
            {
                status: UserGiftStatus.REDEEMED,
            },
            { new: true }
        );

        // send notification When a user collects a gift.
        try {
            await this.notificationService.sendNotificationToSingleDevice(
                'Congrats! You have Collect a gift.',
                `You have collected your gift (${userGift.gift.name}).`,
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
    async fetch(user?: string, gift?: string, status?: UserGiftStatus, withPopulate?: boolean) {
        const query = {};
        if (user) query['user'] = new mongoose.Types.ObjectId(user);
        if (gift) query['gift'] = new mongoose.Types.ObjectId(gift);
        if (status) query['status'] = status;
        const histories = (await this.model
            .find(query)
            .populate(withPopulate ? ['user', 'gift'] : [])
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
    async fetchAllGiftByUser(user: string, withPopulate?: boolean) {
        const [allGifts, userHistory] = await Promise.all([
            this.giftService.fetch(),
            this.fetch(user, null, null, withPopulate),
        ]);

        return allGifts.map((gift: any) => ({
            ...gift._doc,
            userHistory: userHistory.find(
                (history) => history.gift.toString() === gift._id.toString()
            ),
        }));
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string, withPopulate?: boolean): Promise<UserGiftDocument> {
        try {
            return this.model
                .findById(id)
                .populate(withPopulate ? ['user', 'gift'] : [])
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
    async delete(id: string) {
        try {
            return await this.model.findByIdAndDelete(id);
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    async getExpiredUserGiftsIds(excludedIds: any[]) {
        const items = await this.model.find({
            _id: { $nin: excludedIds },
            status: UserGiftStatus.PENDING,
            isExpired: false,
        });

        return items.map((item) => item._id);
    }

    async updateStatusOfExpiredUserGifts(ids: any[]) {
        return this.model.updateMany({ _id: { $in: ids } }, { $set: { isExpired: true } });
    }
}
