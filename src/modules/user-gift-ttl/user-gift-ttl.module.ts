import { UserGiftTtlService } from './user-gift-ttl.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlSchema } from './schema/user-gift-ttl.schema';
import { forwardRef, Global, Module } from '@nestjs/common';
import { UserGiftTtlJob } from './user-gift-ttl-job';
import { UserGiftModule } from '../user-gift/user-gift.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserGiftTtl.name,
                schema: UserGiftTtlSchema,
            },
        ]),
        forwardRef(() => UserGiftModule),
    ],
    controllers: [],
    providers: [UserGiftTtlService, UserGiftTtlJob],
    exports: [UserGiftTtlService],
})
export class UserGiftTtlModule {}
