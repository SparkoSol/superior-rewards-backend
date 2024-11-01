import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';
import * as process from 'process';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
    createMongooseOptions(): MongooseModuleOptions {
        console.log('MONGO_URI', process.env.MONGO_URI);
        return {
            uri: process.env.MONGO_URI,
        };
    }
}
