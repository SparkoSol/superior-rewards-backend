import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TermsHub, TermsHubDocument } from './schema/terms-hub.schema';
import { TermsHubCreateDto, TermsHubUpdateDto } from './dto/terms-hub.dto';

@Injectable()
export class TermsHubService {
    constructor(@InjectModel(TermsHub.name) private readonly model: Model<TermsHubDocument>) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(TermsHubCreateDto: TermsHubCreateDto) {
        try {
            const existingItem = await this.model
                .findOne({
                    type: TermsHubCreateDto.type,
                })
                .exec();
            if (existingItem) {
                return await this.model.findByIdAndUpdate(
                    { _id: existingItem._id },
                    TermsHubCreateDto,
                    { new: true }
                );
            } else {
                return await this.model.create(TermsHubCreateDto);
            }
        } catch (e) {
            console.log('Error while creating terms-hub: ', e);
            throw new InternalServerErrorException('Error while creating terms-hub');
        }
    }

    /*******************************************************************
     * findAll
     ******************************************************************/
    async findAll(type?: string) {
        try {
            const query = {};
            if (type) query['type'] = type;
            return await this.model.find(query).sort({ createdAt: -1 }).exec();
        } catch (e) {
            console.log('Error while getting terms-hubs: ', e);
            throw new InternalServerErrorException('Error while getting terms-hubs');
        }
    }

    /*******************************************************************
     * findOne
     ******************************************************************/
    async findOne(id: string) {
        try {
            return await this.model.findById(id).populate('createdBy').exec();
        } catch (e) {
            throw new NotFoundException('What You Are Looking For Not Found');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, TermsHubUpdateDto: TermsHubUpdateDto) {
        try {
            return await this.model
                .findByIdAndUpdate(id, TermsHubUpdateDto)
                .setOptions({ new: true });
        } catch (e) {
            throw new InternalServerErrorException(e);
        }
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    async remove(id: string, res: any) {
        try {
            const data = await this.findOne(id);
            if (data) {
                const result = await this.model.findByIdAndDelete(id);
                res.status(200).send(result);
            } else {
                res.status(404).send({
                    message: 'Data You are Trying to Delete Not Existed',
                    statusCode: 404,
                });
            }
        } catch (e) {
            console.log('Error while deleting terms-hub: ', e);
            throw new InternalServerErrorException('Error while deleting terms-hub');
        }
    }
}
