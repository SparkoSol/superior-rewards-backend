import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(): string {
        return `Superior Gas reward backend is running...🎉🎉🎉, Port:[${process.env.APP_PORT}] & Environment:[${process.env.NODE_ENVIRONMENT}]`;
    }
}
