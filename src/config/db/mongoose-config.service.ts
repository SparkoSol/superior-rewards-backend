import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import * as process from 'process';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
    createMongooseOptions(): MongooseModuleOptions {
        Logger.debug('MONGO_URI', process.env.MONGO_URI);
        return {
            uri: process.env.MONGO_URI,
        };
    }
}
