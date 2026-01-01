import {
    TransactionCreateRequest,
    TransactionFiltersDto,
    TransactionReportDto,
} from './dto/transaction.dto';
import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import { NotificationService } from '../notification/notification.service';
import { MongoQueryUtils } from '../../utils/mongo-query-utils';
import { PersonService } from '../person/person.service';
import { TransactionType } from './enum/type.enum';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as XLSX from 'xlsx';

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transaction.name) private readonly model: Model<TransactionDocument>,
        private readonly notificationService: NotificationService,
        private readonly personService: PersonService
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
                Logger.error('Error while sending notification on CREDIT type transactions: ', e);
            }
        }

        return transaction;
    }

    async createWithoutCoinCalculation(data: TransactionCreateRequest) {
        const transaction = await this.model.create(data);

        // if new transaction credit, it points should add in user's points.
        if (transaction.type === TransactionType.CREDIT) {
            const person = await this.personService.findOne(transaction.user);

            try {
                await this.notificationService.sendNotificationToSingleDevice(
                    'Congrats! You have received points.',
                  `You have received ${transaction.points} points.`,
                  transaction.user,
                  person.fcmTokens
                );
            } catch (e) {
                Logger.error('Error while sending notification on CREDIT type transactions: ', e);
            }
        }

        return transaction;
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    async filters(data: TransactionFiltersDto) {
        const { page, pageSize, user, filters, populated, withPopulate } = data;
        const query = [];

        for (const key in filters) {
            if (key.startsWith('_id')) {
                const value = filters[key];
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return {
                        data: [],
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        filters: {},
                    };
                }
            }
        }

        if (filters) {
            query.push({ $match: MongoQueryUtils.getQueryFromFilters(filters) });
        }

        if (user) {
            query.push({
                $match: {
                    user: new mongoose.Types.ObjectId(user),
                },
            });
        }

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
                }
            );

            if (populated) {
                const populatedMatchStages = MongoQueryUtils.createDynamicMatchStages(populated);
                query.push(...populatedMatchStages);
            }
        }

        const totalCountPipeline = [...query, { $count: 'totalCount' }];
        const totalCountResult = await this.model.aggregate(totalCountPipeline).exec();
        const totalCount = totalCountResult.length > 0 ? totalCountResult[0].totalCount : 0;

        query.push(
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * pageSize },
            { $limit: pageSize }
        );

        const transactions = await this.model.aggregate(query).exec();

        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: transactions,
            page,
            pageSize: transactions.length,
            totalPages,
            filters,
        };
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
            console.log('No data found!', e);
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * generateReport
     ******************************************************************/
    async generateReport(data: TransactionReportDto): Promise<Buffer> {
        const { startDate, endDate, type } = data;

        const query: any = {
            createdAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
            },
        };

        if (type) {
            query.type = type;
        }

        const transactions = await this.model
            .find(query)
            .populate('user', 'name phone email')
            .populate('performedBy', 'name phone')
            .sort({ createdAt: -1 })
            .exec();

        const reportData = transactions.map((transaction: any) => ({
            'Transaction ID': transaction._id.toString(),
            'Customer Name': transaction.user?.name || 'N/A',
            'Customer Phone': transaction.customerPhone || transaction.user?.phone || 'N/A',
            'Customer Email': transaction.user?.email || 'N/A',
            'Invoice No': transaction.invoiceNo || 'N/A',
            Amount: transaction.amount || 0,
            Points: transaction.points,
            Type: transaction.type,
            Details: transaction.details || 'N/A',
            'Performed By': transaction.performedBy?.name || 'N/A',
            'Created At': transaction.createdAt?.toISOString() || 'N/A',
        }));

        const worksheet = XLSX.utils.json_to_sheet(reportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return buffer;
    }
}
