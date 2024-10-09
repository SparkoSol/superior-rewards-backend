import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlDocument } from './schema/user-gift-ttl.schema';
import { Model } from 'mongoose';
import { UserGiftTtlCreateRequest } from './dto/user-gift-ttl.dto';
import { UserGiftService } from '../user-gift/user-gift.service';

@Injectable()
export class UserGiftTtlService implements OnModuleInit {
    private changeStreamInitialized = false; // Track whether change stream has been initialized

    constructor(
        @InjectModel(UserGiftTtl.name) private readonly model: Model<UserGiftTtlDocument>,
        @Inject(forwardRef(() => UserGiftService))
        private readonly UserGiftService: UserGiftService
    ) {}

    async onModuleInit() {
        if (!this.changeStreamInitialized) {
            this.startChangeStream();
            this.changeStreamInitialized = true; // Ensure change stream is only initialized once
        } else {
            console.log('Change stream already Initialized');
        }
    }

    private startChangeStream() {
        // Watch only for delete operations on the UserGift collection
        const changeStream = this.model.watch([{ $match: { operationType: 'delete' } }]);

        changeStream.on('change', async (change) => {
            const userGiftId = change.documentKey._id;

            // Reinsert the document with isExpired = true to prevent re-deletion
            await this.UserGiftService.update(userGiftId, { isExpired: true });
            console.log(`Updated isExpired for UserGift: ${userGiftId} on ${new Date().toLocaleString()}`);
        });

        changeStream.on('error', (err) => {
            console.error('Change stream error:', err);
        });
    }

    /*******************************************************************
     * create
     ******************************************************************/
    async create(data: UserGiftTtlCreateRequest) {
        return await this.model.create(data);
    }

    async fetchById(id: string) {
        return await this.model.findById(id).exec();
    }

    async fetch() {
        return await this.model.find().exec();
    }

    async getAllReferenceIdsInArray() {
        const records = await this.model.find().exec();
        return records.map((record) => record._id);
    }

    async deleteById(userGiftTtlId: string) {
        return await this.model.findByIdAndDelete(userGiftTtlId).exec();
    }
}
