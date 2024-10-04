import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './schema/setting.schema';
import mongoose, { Model } from 'mongoose';
import { SettingRequest } from './dto/setting.dto';

@Injectable()
export class SettingService {
    constructor(@InjectModel(Setting.name) private readonly model: Model<SettingDocument>) {}

    /*******************************************************************
     * createOrUpdate
     ******************************************************************/
    async createOrUpdate(data: SettingRequest) {
        const settings = await this.model.findOne({ user: data.user });
        if (settings) {
            return this.model.findByIdAndUpdate(settings.id, data, { new: true });
        } else {
            return await this.model.create(data);
        }
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(user?: string) {
        const query = {};
        query['user'] = new mongoose.Types.ObjectId(user);
        return this.model.find(query).sort({ createdAt: -1 }).exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string): Promise<SettingDocument> {
        try {
            return this.model.findById(id).exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }
}
