import {
    Injectable,
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGift, UserGiftDocument } from './schema/user-gift.schema';
import mongoose, { Model } from 'mongoose';
import { UserGiftCreateRequest } from './dto/user-gift.dto';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/enum/type.enum';
import { PersonService } from '../person/person.service';
import { GiftService } from '../gift/gift.service';
import { GiftStatus } from './enum/status.enum';
import { NoGeneratorUtils } from '../../utils/no-generator-utils';

@Injectable()
export class UserGiftService {
    constructor(
        @InjectModel(UserGift.name) private readonly model: Model<UserGiftDocument>,
        private readonly personService: PersonService,
        private readonly giftService: GiftService,
        private readonly transactionService: TransactionService
    ) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: UserGiftCreateRequest) {
        const person = await this.personService.findOne(data.user);
        if (!person) throw new NotAcceptableException('Invalid user id!');

        const gift = await this.giftService.fetchById(data.gift);
        if (!gift) throw new NotAcceptableException('Invalid gift id!');

        data['qrCode'] = await NoGeneratorUtils.generateCode();

        const userGift = await this.model.create(data);

        // create DEBIT type transaction, when user redeemed a gift
        await this.transactionService.create({
            user: data.user,
            customerPhone: person.phone,
            points: gift.points,
            type: TransactionType.DEBIT,
        });

        // Deduct git points from user current points
        await this.personService.update(data.user, {
            ...person,
            points: person.points - gift.points,
        });

        // increase redeemedPoints
        await this.personService.update(data.user, {
            ...person,
            points: person.redeemedPoints + gift.points,
        });

        // TODO: set notification here

        return userGift;
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(user?: string, status?: GiftStatus) {
        let query = {};
        if (user) query['user'] = new mongoose.Types.ObjectId(user);
        if (status) query['status'] = status;
        return this.model.find(query).sort({ createdAt: -1 }).exec();
    }

    /*******************************************************************
     * fetchAllGiftByUser
     ******************************************************************/
    async fetchAllGiftByUser(user: string) {
        const [allGifts, userHistory] = await Promise.all([
            this.giftService.fetch(),
            this.fetch(user),
        ]);

        return allGifts.map((gift) => ({
            ...gift,
            userHistory: userHistory.find((history) => history.gift.toString() === gift._id.toString()),
        }));
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string): Promise<UserGiftDocument> {
        try {
            return this.model.findById(id).exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    // async update(id: string, data: UserGiftUpdateRequest) {
    //   try {
    //     return await this.model.findByIdAndUpdate(id, data, { new: true });
    //   } catch (e) {
    //     throw new InternalServerErrorException('Unexpected Error');
    //   }
    // }

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
}
