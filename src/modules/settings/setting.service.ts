import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Setting, SettingDocument } from './schema/setting.schema';
import { Model } from 'mongoose';
import { SettingRequest } from './dto/setting.dto';

@Injectable()
export class SettingService {
    constructor(@InjectModel(Setting.name) private readonly model: Model<SettingDocument>) {}

    /*******************************************************************
     * createOrUpdate
     ******************************************************************/
    async createOrUpdate(data: SettingRequest) {
        const setting = await this.fetch();
        if (setting) {
            return this.model.findByIdAndUpdate(setting.id, data, { new: true });
        } else {
            return await this.model.create(data);
        }
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch() {
        const settings = await this.model.find().sort({ createdAt: -1 }).exec();
        return settings[0];
    }
}
