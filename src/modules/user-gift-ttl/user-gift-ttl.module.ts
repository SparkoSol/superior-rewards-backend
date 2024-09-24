import { UserGiftTtlService } from './user-gift-ttl.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGiftTtl, UserGiftTtlSchema } from './schema/user-gift-ttl.schema';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: UserGiftTtl.name,
                schema: UserGiftTtlSchema,
            },
        ]),
    ],
    controllers: [],
    providers: [UserGiftTtlService],
    exports: [UserGiftTtlService],
})
export class UserGiftTtlModule {}
