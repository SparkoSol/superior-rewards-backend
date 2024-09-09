import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGift, UserGiftDocument } from './schema/user-gift.schema';
import mongoose, { Model } from 'mongoose';
import { UserGiftCreateRequest, UserGiftUpdateRequest } from './dto/user-gift.dto';
import { TransactionService } from '../transaction/transaction.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransactionType } from '../transaction/enum/type.enum';
import { PersonService } from '../person/person.service';
import { GiftService } from '../gift/gift.service';
import { GiftStatus } from './enum/status.enum';
import { NoGeneratorUtils } from '../../utils/no-generator-utils';

@Injectable()
export class UserGiftService {
  constructor(
    @InjectModel(UserGift.name)
    private readonly model: Model<UserGiftDocument>,
    private readonly personService: PersonService,
    private readonly giftService: GiftService,
    private readonly transactionService: TransactionService
  ) {}

  /*******************************************************************
   * create
   ******************************************************************/
  async create(data: UserGiftCreateRequest) {
    const person = await this.personService.findOne(data.user);
    if(!person) throw new NotFoundException('Invalid user id!');

    const gift = await this.giftService.fetchById(data.gift);
    if(!gift) throw new NotFoundException('Invalid gift id!');


    data ['qrCode'] = await NoGeneratorUtils.generateCode();

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
      points: person.points - gift.points
    })

    return userGift;
  }

  /*******************************************************************
   * fetch
   ******************************************************************/
  async fetch(user?:string, status?:GiftStatus) {
    let query = {};
    if(user) query['user'] = new mongoose.Types.ObjectId(user);
    if(status) query['status'] = status
    return this.model.find(query).sort({ createdAt: -1 }).exec();
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
