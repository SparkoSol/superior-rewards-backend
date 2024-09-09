import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schema/transaction.schema';
import { Model } from 'mongoose';
import {
  TransactionCreateRequest,
  TransactionUpdateRequest,
} from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly model: Model<TransactionDocument>,
  ) {}

  /*******************************************************************
   * create
   ******************************************************************/
  async create(data: TransactionCreateRequest) {
    try {
      return this.model.create(data);
    } catch (e) {
      throw new InternalServerErrorException('Unexpected Error');
    }
  }

  /*******************************************************************
   * fetch
   ******************************************************************/
  async fetch() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  /*******************************************************************
   * fetchById
   ******************************************************************/
  async fetchById(id: string): Promise<TransactionDocument> {
    try {
      return this.model.findById(id).exec();
    } catch (e) {
      throw new NotFoundException('No data found!');
    }
  }

  /*******************************************************************
   * update
   ******************************************************************/
  async update(id: string, data: TransactionUpdateRequest) {
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
}
