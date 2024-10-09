import { SettingService } from './setting.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingController } from './setting.controller';
import { Setting, SettingSchema } from './schema/setting.schema';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
    imports: [MongooseModule.forFeature([{ name: Setting.name, schema: SettingSchema }])],
    controllers: [SettingController],
    providers: [SettingService],
    exports: [SettingService],
})
export class SettingModule {}
