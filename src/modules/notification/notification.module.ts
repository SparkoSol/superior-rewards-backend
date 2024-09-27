import { Module, forwardRef } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from '../notification/schema/notification.schema';
import { PersonModule } from '../person/person.module';
import { NotificationService } from './notification.service';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
        forwardRef(() => PersonModule),
        AuthModule,
    ],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
