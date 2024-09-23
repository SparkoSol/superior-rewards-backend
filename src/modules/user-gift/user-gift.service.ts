import {
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
import { GiftStatus } from './enum/status.enum';
import { NoGeneratorUtils } from '../../utils/no-generator-utils';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import * as process from 'node:process';

@Injectable()
export class UserGiftService {
    constructor(
        @InjectModel(UserGift.name) private readonly model: Model<UserGiftDocument>,
        @InjectQueue('user-gift-queue') private userGiftQueue: Queue,
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
            points: Number(person.points) - Number(gift.points),
        });

        // increase redeemedPoints
        await this.personService.update(data.user, {
            ...person,
            redeemedPoints: Number(person.redeemedPoints) + Number(gift.points),
        });

        // TODO: checking queue systems
        await this.addNewJobInUserGiftQueue(userGift);

        // TODO: set notification here

        return userGift;
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(user?: string, gift?: string, status?: GiftStatus, withPopulate?: boolean) {
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

        return allGifts.map((gift) => ({
            ...gift,
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
        // for Admin, when pending gift is redeemed
        if (data.status === GiftStatus.REDEEMED) {
            await this.removeJobFromUserGiftQueue(id);
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

    async addNewJobInUserGiftQueue(userGift: UserGiftDocument) {
        const job = await this.userGiftQueue.add('user-git-job', userGift, {
            jobId: userGift._id.toString(),
            delay: +process.env.USER_GIFTS_REDEEMED_DELAY,
        });

        await job.log(
            `${new Date().toLocaleString()}: LOG :: New created job in queue:  ${JSON.stringify({
                jobId: job.id,
                userGift,
            })}`
        );

        return job;
    }

    async removeJobFromUserGiftQueue(id: string) {
        try {
            await this.userGiftQueue.remove(id);
        } catch (e) {
            console.log('=======================');
            console.log('Error in removing job: ', e);
            console.log('=======================');
        }
    }
}
