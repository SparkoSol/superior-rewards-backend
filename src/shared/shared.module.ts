import { Module } from '@nestjs/common';
import { PDFGeneratorService } from './services/pdf-generator.service';

@Module({
    providers: [PDFGeneratorService],
    exports: [PDFGeneratorService],
})
export class SharedModule {}
