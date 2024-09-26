import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import mongoose, { Model } from 'mongoose';
import { TransactionCreateRequest } from './dto/transaction.dto';
import { TransactionType } from './enum/type.enum';
import { PersonService } from '../person/person.service';

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transaction.name) private readonly model: Model<TransactionDocument>,
        private readonly personService: PersonService
    ) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: TransactionCreateRequest) {
        try {
            const transaction = await this.model.create(data);

            // if new transaction credit, it points should add in user's points.
            if (transaction.type === TransactionType.CREDIT) {
                const person = (await this.personService.findOne(transaction.user)) as any;

                await this.personService.update(transaction.user, {
                    ...person._doc,
                    points: Number(person.points) + Number(transaction.points),
                });

                // TODO: has to send notification
            }

            return transaction;
        } catch (e) {
            console.log('Error while creating transaction', e);
            if(e && e?.code === 11000) {
                throw new NotAcceptableException('Invoice No already exists!');
            }
        }
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

    /*******************************************************************
     * update
     ******************************************************************/
    // async update(id: string, data: TransactionUpdateRequest) {
    //   try {
    //     return await this.model.findByIdAndUpdate(id, data, { new: true });
    //   } catch (e) {
    //     throw new InternalServerErrorException('Unexpected Error');
    //   }
    // }

    /*******************************************************************
     * delete
     ******************************************************************/
    // async delete(id: string) {
    //   try {
    //     return await this.model.findByIdAndDelete(id);
    //   } catch (e) {
    //     throw new InternalServerErrorException('Unexpected Error');
    //   }
    // }
}
