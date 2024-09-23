import { UserGiftService } from './user-gift.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGiftController } from './user-gift.controller';
import { UserGift, UserGiftSchema } from './schema/user-gift.schema';
import { Global, Module } from '@nestjs/common';
import { TransactionModule } from '../transaction/transaction.module';
import { PersonModule } from '../person/person.module';
import { GiftModule } from '../gift/gift.module';
import { BullModule } from '@nestjs/bullmq';
import { UserGiftConsumer } from './user-gift.consumer';

@Global()
@Module({
    imports: [
        BullModule.registerQueue({
            name: 'user-gift-queue',
        }),
        MongooseModule.forFeature([{ name: UserGift.name, schema: UserGiftSchema }]),
        PersonModule,
        GiftModule,
        TransactionModule,
    ],
    controllers: [UserGiftController],
    providers: [UserGiftService, UserGiftConsumer],
    exports: [UserGiftService],
})
export class UserGiftModule {}
