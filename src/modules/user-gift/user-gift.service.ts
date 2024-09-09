import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGift, UserGiftDocument } from './schema/user-gift.schema';
import { Model } from 'mongoose';
import { UserGiftCreateRequest, UserGiftUpdateRequest } from './dto/user-gift.dto';

@Injectable()
export class UserGiftService {
  constructor(
    @InjectModel(UserGift.name)
    private readonly model: Model<UserGiftDocument>,
  ) {}

  /*******************************************************************
   * create
   ******************************************************************/
  async create(data: UserGiftCreateRequest) {
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
  async update(id: string, data: UserGiftUpdateRequest) {
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
