import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schema/permission.schema';
import { Model } from 'mongoose';
import { PermissionCreateRequest, PermissionUpdateRequest } from './dto/permission.dto';

@Injectable()
export class PermissionService {
    constructor(@InjectModel(Permission.name) private readonly model: Model<PermissionDocument>) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: PermissionCreateRequest) {
        try {
            return this.model.create(data);
        } catch (e) {
            throw new InternalServerErrorException('Error while creating Permission');
        }
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch() {
        const query = {};
        return this.model.find(query).sort({ createdAt: -1 }).exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string): Promise<PermissionDocument> {
        try {
            return this.model.findById(id).exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, data: PermissionUpdateRequest) {
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
