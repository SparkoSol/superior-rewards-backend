import {
    forwardRef,
    HttpStatus,
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotAcceptableException,
    NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
    PasswordUpdateRequestDto,
    PersonCreateDto,
    PersonFiltersDto,
    PersonUpdateDto,
    UpdateFcmTokenRequestDto,
} from './dto/person.dto';
import { NotificationService } from '../notification/notification.service';
import { AdminCreateUserRequest, MobileSignUpRequest } from '../auth/dto/sign-up-request.dto';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { helper } from '../../utils/helper';
import { Response } from 'express';
import * as os from 'node:os';
import * as path from 'node:path';
import { RoleService } from '../role/role.service';
import { MongoQueryUtils } from '../../utils/mongo-query-utils';

export type User = any;

@Injectable()
export class PersonService {
    constructor(
        @InjectModel(Person.name) private readonly model: Model<PersonDocument>,
        @Inject(forwardRef(() => NotificationService))
        private readonly notificationService: NotificationService,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService
    ) {}

    async getLastOdooCustomerId() {
        const lastOdooCustomerId = await this.model
            .findOne({ odooCustomerId: { $ne: null } })
            .sort({ odooCustomerId: -1 })
            .exec();
        return lastOdooCustomerId ? Number(lastOdooCustomerId?.odooCustomerId) + 1 : 1;
    }

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: MobileSignUpRequest | AdminCreateUserRequest | PersonCreateDto) {
        return await this.model.create(data);
    }

    async createMany(data: MobileSignUpRequest[] | AdminCreateUserRequest[]) {
        return await this.model.insertMany(data, { ordered: false });
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    async filters(data: PersonFiltersDto) {
        const { page, pageSize, usedFor, filters, populated, withPopulate } = data;
        const skip = (page - 1) * pageSize;

        const role = await this.roleService.fetchByRoleName('User');

        if (!role) {
            throw new NotAcceptableException(
                'Invalid role, please contact admin to add User role.'
            );
        }

        let query = {};
        if (filters) {
            query = MongoQueryUtils.getQueryFromFilters(filters);
        }

        if (usedFor === 'customers') query['role'] = { $eq: role._id };
        if (usedFor === 'users') query['role'] = { $ne: role._id };
        const pipeline: any[] = [
            { $match: query },
            {
                $lookup: {
                    from: 'people',
                    localField: 'performedBy',
                    foreignField: '_id',
                    as: 'performedBy',
                },
            },
            {
                $addFields: {
                    performedBy: { $arrayElemAt: ['$performedBy', 0] },
                },
            },
        ];
        if (usedFor === 'users') {
            pipeline.push(
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'role',
                        foreignField: '_id',
                        as: 'role',
                    },
                },
                { $unwind: '$role' }
            );
        }

        if (populated) {
            const populatedMatchStages = MongoQueryUtils.createDynamicMatchStages(populated);
            pipeline.push(...populatedMatchStages);
        }

        pipeline.push({
            $facet: {
                paginatedResults: [{ $skip: skip }, { $limit: pageSize }],
                totalCount: [{ $count: 'count' }],
            },
        });

        pipeline.push({ $sort: { createdAt: -1 } });
        const result = await this.model.aggregate(pipeline).exec();

        const users = result[0].paginatedResults;
        const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: users,
            page,
            pageSize: users.length,
            totalPages,
            filters,
        };
    }

    async findOne(id: string) {
        return await this.model.findById(id).exec();
    }

    async findByQuery(query: {}) {
        return await this.model.find(query).select('-password').exec();
    }

    async findOneByQuery(query: {}, withPopulate?: boolean) {
        return await this.model
            .findOne(query)
            .select('-password')
            .populate(
                withPopulate
                    ? [
                          'role',
                          {
                              path: 'role',
                              populate: { path: 'permissions' },
                          },
                      ]
                    : []
            )
            .exec();
    }

    async findOneByFcmToken(fcmToken: string) {
        return this.model.findOne({ fcmTokens: { $in: [fcmToken] } });
    }

    async findOneByPhone(phone: string): Promise<User | undefined> {
        return this.model.findOne({ phone }).exec();
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(page: number, pageSize: number, usedFor?: string, withPopulate?: boolean) {
        let users = (await this.model
            .find()
            .populate(
                withPopulate
                    ? [
                          'role',
                          'performedBy',
                          {
                              path: 'role',
                              populate: { path: 'permissions' },
                          },
                      ]
                    : []
            )
            .sort({ createdAt: -1 })
            .exec()) as any;

        if (usedFor && usedFor === 'users')
            users = users.filter((user: any) => user.role.name !== 'User');
        if (usedFor && usedFor === 'customers')
            users = users.filter((user: any) => user.role.name === 'User');

        return await MongoQueryUtils.getPaginatedResponse(users, {}, page, pageSize);
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string, withPopulate?: boolean): Promise<PersonDocument> {
        try {
            return this.model
                .findById(id)
                .populate(
                    withPopulate
                        ? [
                              'role',
                              'performedBy',
                              { path: 'role', populate: { path: 'permissions' } },
                          ]
                        : []
                )
                .exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * changePassword
     ******************************************************************/
    async changePassword(data: PasswordUpdateRequestDto) {
        const person = await this.findOne(data.person);
        if (person && data.oldPassword === person.password) {
            return this.model.findOneAndUpdate(
                { _id: person._id },
                {
                    password: data.newPassword,
                },
                {
                    new: true,
                }
            );
        } else {
            throw new NotAcceptableException('Old Password Not Correct!');
        }
    }

    /*******************************************************************
     * updateFcmToken
     ******************************************************************/
    async updateFcmToken(id: string, data: UpdateFcmTokenRequestDto) {
        const person = await this.model.findById(id).exec();
        if (!person) return;

        let channel: string;
        if (process.env.NODE_ENVIRONMENT === 'production') channel = 'news';
        else channel = 'news-staging';

        await this.notificationService.subscribedToNotificationChannel(data.fcmToken, channel);
        if (person.fcmTokens && person.fcmTokens.length > 0) {
            const foundElements = person.fcmTokens.find((value) => value == data.fcmToken);
            if (!foundElements) {
                if (person.fcmTokens.length >= 10) person.fcmTokens.shift();
                person.fcmTokens.push(data.fcmToken);
            }
        } else person.fcmTokens = [data.fcmToken];
        await person.save();

        return person;
    }

    async removeFcmToken(id: string, fcmToken: string) {
        const person = await this.findOne(id);
        if (!person) throw new NotFoundException('Person not found!');

        if (!person.fcmTokens || person.fcmTokens.length === 0) return person;

        return await this.update(id, {
            fcmTokens: person.fcmTokens.filter((token) => token !== fcmToken),
        });
    }

    /*******************************************************************
     * bulkUpload
     ******************************************************************/
    async bulkUpload(file: any, res: Response) {
        const xlsDocsItems = [];
        let failedDocsCount = 0;
        let totalDocs = 0;

        const tempFilePath = path.join(os.tmpdir(), 'temp.csv');

        const fileData = Buffer.isBuffer(file) ? file : Buffer.from(file.buffer || file.data || '');

        fs.writeFileSync(tempFilePath, fileData);

        const sheetData = xlsx.utils.sheet_to_json(
            xlsx.readFile(tempFilePath).Sheets[xlsx.readFile(tempFilePath).SheetNames[0]]
        );

        const roleId = (await this.roleService.fetchByRoleName('User'))._id.toString();
        const lastOdooId = await this.getLastOdooCustomerId();

        if (!roleId) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Invalid Role');
        totalDocs = sheetData.length;

        // Process each row from the sheet data as you did with CSV
        for (let index = 0; index < sheetData.length; index++) {
            const customer: any = sheetData[index];
            if (customer) {
                const defaultKeys = [
                    'Display Name',
                    'Phone',
                    'Country',
                    'Loyalty Points.',
                    'Customer Number',
                    'Complete Address',
                ];
                const csvKeys = Object.keys(customer);
                const isDefault = defaultKeys.some((key) => csvKeys.includes(key));
                if (!isDefault) {
                    throw new Error(
                        'Invalid File Format. Please check sample file format and try again.'
                    );
                }
            }
            if (customer['Phone'] && customer['Customer Number'] && customer['Display Name']) {
                xlsDocsItems.push({
                    name: helper.capitalizeFirstChar(customer['Display Name']),
                    phone: customer['Phone'].replace(/[\(\)-]/g, ''),
                    email: customer['Email'] ?? '',
                    country: customer['Country'] ?? '',
                    points: customer['Loyalty Points.'],
                    customerNumber: customer['Customer Number'],
                    address: customer['Complete Address'].replace(/[\n\r]/g, ''),
                    addedInOdoo: true,
                    role: roleId,
                    odooCustomerId: lastOdooId + (index + 1),
                    password: '12345678',
                });
            } else {
                failedDocsCount++;
            }
        }

        const existingPhones = await this.model
            .find(
                { phone: { $in: xlsDocsItems.map((item) => item.phone) } },
                { phone: 1 } // Only select the `phone` field to reduce payload
            )
            .then((results) => results.map((doc) => doc.phone));

        const newRecords = xlsDocsItems.filter((item) => !existingPhones.includes(item.phone));

        try {
            const successDocs = await this.createMany(newRecords);

            failedDocsCount = failedDocsCount + (xlsDocsItems.length - successDocs.length);

            res.status(HttpStatus.OK).send({
                totalDocs,
                successDocs: successDocs.length,
                failedDocs: failedDocsCount,
            });
        } catch (e) {
            Logger.error(`Error while bulk upload :: ${e}`);
        }

        fs.unlinkSync(tempFilePath);
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, data: PersonUpdateDto) {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    /*******************************************************************
     * updateMany w.r.t query
     ******************************************************************/
    async updateMany(query: any, data: any) {
        try {
            return await this.model.updateMany(query, data);
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    async delete(id: string) {
        try {
            return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    async revokeRoleFromPersonsIdsArray(personIds: any) {
        try {
            return await this.model.updateMany(
                { _id: { $in: personIds } },
                { $set: { role: null } }
            );
        } catch (error) {
            Logger.error(`Error setting role to null :: ${error}`);
        }
    }

    async isAuthorize(userId: string) {
        const user = await this.model.findById(userId).exec();

        return !(user.session && true);
    }
}
