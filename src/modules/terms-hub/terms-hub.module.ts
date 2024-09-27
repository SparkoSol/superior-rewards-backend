import { Module } from '@nestjs/common';
import { TermsHubService } from './terms-hub.service';
import { TermsHubController } from './terms-hub.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TermsHub, TermsHubSchema } from './schema/terms-hub.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: TermsHub.name, schema: TermsHubSchema }])],
    controllers: [TermsHubController],
    providers: [TermsHubService],
})
export class TermsHubModule {}
