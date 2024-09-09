import { UserGiftService } from './user-gift.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGiftController } from './user-gift.controller';
import { UserGift, UserGiftSchema } from './schema/user-gift.schema';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserGift.name, schema: UserGiftSchema },
    ]),
  ],
  controllers: [UserGiftController],
  providers: [UserGiftService],
  exports: [UserGiftService],
})
export class UserGiftModule {}
