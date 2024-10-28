import { Injectable } from '@nestjs/common';
import * as process from 'process';

@Injectable()
export class AppService {
    getHello(): string {
        return `Welcome! Superior Backend is running on Port:[${process.env.APP_PORT}], & Environment:[${process.env.NODE_ENVIRONMENT}]... 😊🎉`;
    }
}
