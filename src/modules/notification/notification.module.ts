import { Notification, NotificationSchema } from './schema/notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PersonModule } from '../person/person.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
        forwardRef(() => PersonModule),
        forwardRef(() => AuthModule),
    ],
    controllers: [NotificationController],
    providers: [NotificationService],
    exports: [NotificationService],
})
export class NotificationModule {}
