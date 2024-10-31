import { UserGiftTtlService } from './user-gift-ttl.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlSchema } from './schema/user-gift-ttl.schema';
import { forwardRef, Module } from '@nestjs/common';
import { UserGiftTtlJob } from './user-gift-ttl-job';
import { UserGiftModule } from '../user-gift/user-gift.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserGiftTtl.name,
                schema: UserGiftTtlSchema,
            },
        ]),
        forwardRef(() => UserGiftModule),
        NotificationModule,
    ],
    controllers: [],
    providers: [UserGiftTtlService, UserGiftTtlJob],
    exports: [UserGiftTtlService],
})
export class UserGiftTtlModule {}
