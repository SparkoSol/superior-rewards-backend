import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Gift, GiftDocument } from './schema/gift.schema';
import { Model } from 'mongoose';
import { GiftCreateRequest, GiftUpdateRequest } from './dto/gift.dto';

@Injectable()
export class GiftService {
    constructor(@InjectModel(Gift.name) private readonly model: Model<GiftDocument>) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: GiftCreateRequest) {
        try {
            return this.model.create(data);
        } catch (e) {
            throw new InternalServerErrorException('Error while creating gift');
        }
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch() {
        const query = {};
        query['deletedAt'] = { $eq: null };
        return this.model.find(query).sort({ createdAt: -1 }).exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string): Promise<GiftDocument> {
        try {
            return this.model.findById(id).exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, data: GiftUpdateRequest) {
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
            return await this.model.findByIdAndUpdate(id, { deletedAt: new Date() });
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }
}
