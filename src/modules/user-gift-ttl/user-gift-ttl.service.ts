import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlDocument } from './schema/user-gift-ttl.schema';
import { Model } from 'mongoose';
import { UserGiftTtlCreateRequest } from './dto/user-gift-ttl.dto';

@Injectable()
export class UserGiftTtlService {
    constructor(
        @InjectModel(UserGiftTtl.name) private readonly model: Model<UserGiftTtlDocument>
    ) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: UserGiftTtlCreateRequest) {
        return await this.model.create(data);
    }

    async getAllReferenceIdsInArray() {
        const records = await this.model.find().exec();
        return records.map((record) => record.userGift);
    }

    async deleteById(userGiftTtlId: string) {
        return await this.model.findByIdAndDelete(userGiftTtlId).exec();
    }
}
