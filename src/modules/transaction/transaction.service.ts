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
import { PDFGeneratorService } from '../../shared/services/pdf-generator.service';
import { WhatsAppService } from '../../shared/services/whatsapp.service';

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transaction.name) private readonly model: Model<TransactionDocument>,
        private readonly notificationService: NotificationService,
        private readonly personService: PersonService,
        private readonly pdfGeneratorService: PDFGeneratorService,
        private readonly whatsAppService: WhatsAppService
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
            const previousBalance = Number(person.points);
            const newBalance = previousBalance + Number(transaction.points);

            await this.personService.update(transaction.user, {
                points: newBalance,
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

            // Send WhatsApp notification via Picky Assist
            try {
                await this.whatsAppService.sendPointsNotification({
                    phone: person.phone,
                    customerName: person.name,
                    pointsEarned: Number(transaction.points),
                    previousBalance,
                    newBalance,
                });
            } catch (e) {
                Logger.error(
                    'Error while sending WhatsApp notification on CREDIT type transactions: ',
                    e
                );
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
     * generateReport (Excel)
     ******************************************************************/
    async generateReport(data: TransactionReportDto): Promise<Buffer> {
        const { startDate, endDate, type } = data;

        // Set start date to beginning of day (00:00:00.000)
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        // Set end date to end of day (23:59:59.999)
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const query: any = {
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
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

        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    /*******************************************************************
     * generatePDFReport
     ******************************************************************/
    async generatePDFReport(data: TransactionReportDto): Promise<Buffer> {
        const { startDate, endDate, type } = data;

        // Set start date to beginning of day (00:00:00.000)
        const startOfDay = new Date(startDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        // Set end date to end of day (23:59:59.999)
        const endOfDay = new Date(endDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const query: any = {
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay,
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

        // Calculate total points
        const totalPoints = transactions.reduce((sum, t: any) => sum + (t.points || 0), 0);

        // Transform data for PDF
        const reportData = transactions.map((transaction: any) => ({
            transactionId: transaction._id.toString(),
            customerName: transaction.user?.name || 'N/A',
            customerPhone: transaction.customerPhone || transaction.user?.phone || 'N/A',
            invoiceNo: transaction.invoiceNo || 'N/A',
            amount: transaction.amount || 0,
            points: transaction.points || 0,
            type: transaction.type,
            details: transaction.details || 'N/A',
            performedBy: transaction.performedBy?.name || 'N/A',
            createdAt: transaction.createdAt,
        }));

        // Generate PDF
        return this.pdfGeneratorService.generateReport({
            title: 'Transaction Report',
            companyName: 'Superior Rewards',
            generatedDate: new Date(),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            columns: [
                { key: 'transactionId', label: 'Transaction ID', width: '12%' },
                { key: 'customerName', label: 'Customer Name', width: '12%' },
                { key: 'customerPhone', label: 'Phone', width: '10%' },
                { key: 'invoiceNo', label: 'Invoice No', width: '10%' },
                { key: 'amount', label: 'Amount', width: '8%' },
                { key: 'points', label: 'Points', width: '8%' },
                { key: 'type', label: 'Type', width: '8%' },
                { key: 'details', label: 'Details', width: '12%' },
                { key: 'performedBy', label: 'Performed By', width: '10%' },
                { key: 'createdAt', label: 'Date', width: '10%' },
            ],
            data: reportData,
            totalPoints: totalPoints,
            footerText: `Report for transactions from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
        });
    }
}
