import { GiftService } from './gift.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftController } from './gift.controller';
import { Gift, GiftSchema } from './schema/gift.schema';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Gift.name, schema: GiftSchema }])],
    controllers: [GiftController],
    providers: [GiftService],
    exports: [GiftService],
})
export class GiftModule {}
