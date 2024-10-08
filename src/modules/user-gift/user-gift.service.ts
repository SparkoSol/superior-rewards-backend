import {
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGift, UserGiftDocument } from './schema/user-gift.schema';
import mongoose, { Model } from 'mongoose';
import { UserGiftCreateRequest, UserGiftUpdateRequest } from './dto/user-gift.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/enum/type.enum';
import { PersonService } from '../person/person.service';
import { GiftService } from '../gift/gift.service';
import { UserGiftStatus } from './enum/status.enum';
import { NoGeneratorUtils } from '../../utils/no-generator-utils';
import { UserGiftTtlService } from '../user-gift-ttl/user-gift-ttl.service';
import { SettingService } from '../settings/setting.service';
import { NotificationService } from '../notification/notification.service';

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

        data['qrCode'] = await NoGeneratorUtils.generateCode();

        const userGift = await this.model.create(data);
        const settings = await this.SettingService.fetch();
        const settingsData = settings[0];
        console.log('settingsData', settingsData);

        // create entry in user-gift-ttl
        await this.UserGiftTtlService.create({
            userGift: userGift._id.toString(),
            createdAt: new Date(new Date().toISOString().replace('Z', '+00:00')),
        });

        // create DEBIT type transaction, when user redeemed a gift
        await this.transactionService.create({
            user: data.user,
            customerPhone: person.phone,
            points: gift.points,
            amount: settingsData.points ? (gift.points / settingsData.points) : null,
            type: TransactionType.DEBIT,
        });

        // Deduct git points from user current points
        await this.personService.update(data.user, {
            points: Number(person.points) - Number(gift.points),
        });

        // increase redeemedPoints
        await this.personService.update(data.user, {
            redeemedPoints: Number(person.redeemedPoints) + Number(gift.points),
        });

        try {
            await this.notificationService.sendNotificationToSingleDevice(
              'Congrats! You have redeem a gift.',
              `You have received ${gift.points} points gift.`,
              person._id,
              person.fcmTokens
            );
        } catch (e) {
            console.log('Error while sending notification on redeem a gift: ', e);
        }

        return userGift;
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(user?: string, gift?: string, status?: UserGiftStatus, withPopulate?: boolean) {
        const query = {};
        if (user) query['user'] = new mongoose.Types.ObjectId(user);
        if (gift) query['gift'] = new mongoose.Types.ObjectId(gift);
        if (status) query['status'] = status;
        return this.model
            .find(query)
            .populate(withPopulate ? ['user', 'gift'] : [])
            .sort({ createdAt: -1 })
            .exec();
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
            isExpired: false,
        });

        return items.map((item) => item._id);
    }

    async updateStatusOfExpiredUserGifts(ids: any[]) {
        return this.model.updateMany({ _id: { $in: ids } }, { $set: { isExpired: true } });
    }
}
