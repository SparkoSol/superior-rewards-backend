import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schema/role.schema';
import { Model } from 'mongoose';
import { RoleDto } from './dto/role.dto';
import { PersonService } from '../person/person.service';

@Injectable()
export class RoleService {
    constructor(@InjectModel(Role.name) private readonly model: Model<RoleDocument>,
                @Inject(forwardRef(() => PersonService))
                private readonly personService: PersonService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: RoleDto) {
        try {
            return this.model.create(data);
        } catch (e) {
            throw new InternalServerErrorException('Error while creating Role');
        }
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    async fetch(withPopulate?: boolean): Promise<RoleDocument[]> {
        const query = {};
        query['deletedAt'] = { $eq: null };
        return this.model
            .find(query)
            .populate(withPopulate ? ['permissions'] : [])
            .sort({ createdAt: -1 })
            .exec();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    async fetchById(id: string): Promise<RoleDocument> {
        try {
            return this.model.findById(id).populate('permissions').exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    async fetchByRoleName(name: string): Promise<RoleDocument> {
        try {
            return this.model
                .findOne({
                    name,
                })
                .populate('permissions')
                .exec();
        } catch (e) {
            throw new NotFoundException('No data found!');
        }
    }

    /*******************************************************************
     * update
     ******************************************************************/
    async update(id: string, data: RoleDto) {
        try {
            return await this.model.findByIdAndUpdate(id, data, { new: true });
        } catch (e) {
            console.log('Error in role update:', e);
            throw new InternalServerErrorException('Unexpected Error');
        }
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    async delete(id: string) {
        const persons = await this.personService.findByQuery({ role: id }) as any;
        const personIds = persons && persons.length ? persons.map((person) => person._id) : [];

        if(personIds.length) {
            await this.personService.revokeRoleFromPersonsIdsArray(personIds);
        }

        try {
            return await this.model.findByIdAndDelete(id);
        } catch (e) {
            throw new InternalServerErrorException('Unexpected Error');
        }
    }
}
