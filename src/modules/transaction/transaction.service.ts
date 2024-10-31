import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import mongoose, { Model } from 'mongoose';
import { TransactionCreateRequest, TransactionFiltersDto } from './dto/transaction.dto';
import { TransactionType } from './enum/type.enum';
import { PersonService } from '../person/person.service';
import { NotificationService } from '../notification/notification.service';
import { MongoQueryUtils } from '../../utils/mongo-query-utils';

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transaction.name) private readonly model: Model<TransactionDocument>,
        private readonly personService: PersonService,
        private readonly notificationService: NotificationService
    ) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: TransactionCreateRequest) {
        if (data.invoiceNo) {
            const isExist = await this.model.findOne({ invoiceNo: data.invoiceNo });
            if (isExist) {
                throw new NotAcceptableException('Invoice No already exists!');
            }
        }

        const transaction = await this.model.create(data);

        // if new transaction credit, it points should add in user's points.
        if (transaction.type === TransactionType.CREDIT) {
            const person = await this.personService.findOne(transaction.user);

            await this.personService.update(transaction.user, {
                points: Number(person.points) + Number(transaction.points),
            });

            try {
                await this.notificationService.sendNotificationToSingleDevice(
                    'Congrats! You have received points.',
                    `You have received ${transaction.points} points.`,
                    transaction.user,
                    person.fcmTokens
                );
            } catch (e) {
                console.log('Error while sending notification on CREDIT type transactions: ', e);
            }
        }

        return transaction;
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    async filters(data: TransactionFiltersDto) {
        const { page, pageSize, user, filters, withPopulate } = data;
        let query = {};
        if (filters) query = MongoQueryUtils.getQueryFromFilters(filters);
        console.log('query', JSON.stringify(query));

        const totalCount = await this.model.countDocuments(query);

        if (user) query['user'] = new mongoose.Types.ObjectId(user);

        const transactions = await this.model
            .find(query)
            .populate(withPopulate ? ['user'] : [])
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .exec();

        const totalPages = Math.ceil(totalCount / pageSize);

        // Structure the response
        return {
            data: transactions,
            page,
            pageSize: transactions.length,
            totalPages,
            filters,
        };

        // return await MongoQueryUtils.getPaginatedResponse(
        //     transactions,
        //     filters || {},
        //     page,
        //     pageSize
        // );
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(user?: string, withPopulate?: boolean): Promise<TransactionDocument[]> {
        const query = {};
        if (user) query['user'] = new mongoose.Types.ObjectId(user);

        return this.model
            .find(query)
            .populate(withPopulate ? ['user'] : [])
            .sort({ createdAt: -1 })
            .exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string, withPopulate?: boolean): Promise<TransactionDocument> {
        try {
            return this.model
                .findById(id)
                .populate(withPopulate ? ['user'] : [])
                .exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }
}
