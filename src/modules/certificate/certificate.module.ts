import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Certificate, CertificateSchema } from './schema/certificate.schema';
import { CertificateService } from './certificate.service';
import { CertificatePdfService } from './certificate-pdf.service';
import { CertificateController } from './certificate.controller';
import { UserGift, UserGiftSchema } from '../user-gift/schema/user-gift.schema';
import { Person, PersonSchema } from '../person/schema/person.schema';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Certificate.name, schema: CertificateSchema },
            { name: UserGift.name, schema: UserGiftSchema },
            { name: Person.name, schema: PersonSchema },
        ]),
    ],
    controllers: [CertificateController],
    providers: [CertificateService, CertificatePdfService],
    exports: [CertificateService],
})
export class CertificateModule {}
