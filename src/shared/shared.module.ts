import { Module } from '@nestjs/common';
import { PDFGeneratorService } from './services/pdf-generator.service';
import { WhatsAppService } from './services/whatsapp.service';

@Module({
    providers: [PDFGeneratorService, WhatsAppService],
    exports: [PDFGeneratorService, WhatsAppService],
})
export class SharedModule {}
