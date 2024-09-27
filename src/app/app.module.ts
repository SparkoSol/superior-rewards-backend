import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '../config/db/db.module';
import { PersonModule } from '../modules/person/person.module';
import { AuthModule } from '../modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../modules/auth/guard/jwt-auth.guard';
import { MulterModule } from '@nestjs/platform-express';
import { ImageUtils } from '../utils/image-utils';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { NoGeneratorUtils } from '../utils/no-generator-utils';
import { extname } from 'path';
import { GiftModule } from '../modules/gift/gift.module';
import { TransactionModule } from '../modules/transaction/transaction.module';
import { NotificationModule } from '../modules/notification/notification.module';
import { TermsHubModule } from '../modules/terms-hub/terms-hub.module';
import { UserGiftModule } from '../modules/user-gift/user-gift.module';
import { UserGiftTtlModule } from '../modules/user-gift-ttl/user-gift-ttl.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        // Config modules
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env.' + process.env.NODE_ENVIRONMENT,
        }), // Multer (File uploading)
        MulterModule.register({
            dest: ImageUtils.imagePath,
            storage: diskStorage({
                destination: (req: any, file: any, cb: any) => {
                    const uploadPath = ImageUtils.imagePath;
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath);
                    }
                    cb(null, uploadPath);
                },
                filename: async (req: any, file: any, cb: any) => {
                    cb(
                        null,
                        `${await NoGeneratorUtils.generateCode(16)}${extname(file.originalname)}`
                    );
                },
            }),
        }), // Schedule module
        ScheduleModule.forRoot(),
        DbModule,
        AuthModule,
        PersonModule,
        TransactionModule,
        GiftModule,
        UserGiftModule,
        UserGiftTtlModule,
        NotificationModule,
        TermsHubModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
