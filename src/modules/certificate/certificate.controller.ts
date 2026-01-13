import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    Res,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiInternalServerErrorResponse,
    ApiParam,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CertificateService } from './certificate.service';
import {
    GenerateCertificateDto,
    CertificateResponseDto,
    VerifyCertificateResponseDto,
    MarkPrintedDto,
} from './dto/certificate.dto';
import { Public } from '../auth/decorators/setmetadata.decorator';

@ApiTags('Certificates')
@ApiBearerAuth('access-token')
@Controller('certificates')
export class CertificateController {
    private readonly logger = new Logger(CertificateController.name);

    constructor(private readonly certificateService: CertificateService) {}

    /*******************************************************************
     * Generate Certificate
     ******************************************************************/
    @Post('generate')
    @ApiOperation({ summary: 'Generate a certificate for a completed redemption' })
    @ApiOkResponse({
        description: 'Certificate generated successfully',
        type: CertificateResponseDto,
    })
    @ApiNotFoundResponse({ description: 'UserGift or generator not found' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    async generateCertificate(@Body() dto: GenerateCertificateDto) {
        this.logger.log(`Generating certificate for UserGift: ${dto.userGiftId}`);
        const certificate = await this.certificateService.generateCertificate(
            dto.userGiftId,
            dto.generatedBy,
            dto.conversionRate
        );
        return {
            success: true,
            message: 'Certificate generated successfully',
            data: certificate,
        };
    }

    /*******************************************************************
     * Get Certificate by ID
     ******************************************************************/
    @Get(':id')
    @ApiOperation({ summary: 'Get certificate details by ID' })
    @ApiParam({ name: 'id', description: 'Certificate ID' })
    @ApiOkResponse({ description: 'Certificate details', type: CertificateResponseDto })
    @ApiNotFoundResponse({ description: 'Certificate not found' })
    async getCertificate(@Param('id') id: string) {
        const certificate = await this.certificateService.getCertificateById(id);
        return {
            success: true,
            data: certificate,
        };
    }

    /*******************************************************************
     * Download Certificate PDF
     ******************************************************************/
    @Get('download/:id')
    @ApiOperation({ summary: 'Download certificate as PDF' })
    @ApiParam({ name: 'id', description: 'Certificate ID' })
    @ApiOkResponse({ description: 'PDF file stream' })
    @ApiNotFoundResponse({ description: 'Certificate not found' })
    async downloadCertificate(@Param('id') id: string, @Res() res: Response) {
        this.logger.log(`Downloading certificate: ${id}`);
        const pdfBuffer = await this.certificateService.downloadCertificate(id);
        const certificate = await this.certificateService.getCertificateById(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="certificate-${certificate.certificateNumber}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });

        res.status(HttpStatus.OK).send(pdfBuffer);
    }

    /*******************************************************************
     * Verify Certificate (Public Endpoint)
     ******************************************************************/
    @Public()
    @Get('verify/:code')
    @ApiOperation({ summary: 'Verify certificate by verification code' })
    @ApiParam({ name: 'code', description: 'Verification code (UUID)' })
    @ApiOkResponse({ description: 'Verification result', type: VerifyCertificateResponseDto })
    async verifyCertificate(@Param('code') code: string): Promise<VerifyCertificateResponseDto> {
        this.logger.log(`Verifying certificate with code: ${code}`);
        return this.certificateService.verifyCertificate(code);
    }

    /*******************************************************************
     * Get Certificates for User
     ******************************************************************/
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all certificates for a customer' })
    @ApiParam({ name: 'userId', description: 'Customer user ID' })
    @ApiOkResponse({ description: 'List of certificates', type: [CertificateResponseDto] })
    async getUserCertificates(@Param('userId') userId: string) {
        const certificates = await this.certificateService.getCertificatesByCustomer(userId);
        return {
            success: true,
            data: certificates,
            count: certificates.length,
        };
    }

    /*******************************************************************
     * Mark Certificate as Printed
     ******************************************************************/
    @Post(':id/printed')
    @ApiOperation({ summary: 'Mark certificate as printed' })
    @ApiParam({ name: 'id', description: 'Certificate ID' })
    @ApiOkResponse({ description: 'Certificate marked as printed', type: CertificateResponseDto })
    @ApiNotFoundResponse({ description: 'Certificate not found' })
    async markAsPrinted(@Param('id') id: string, @Body() dto: MarkPrintedDto) {
        this.logger.log(`Marking certificate as printed: ${id}`);
        const certificate = await this.certificateService.markAsPrinted(id);
        return {
            success: true,
            message: 'Certificate marked as printed',
            data: certificate,
        };
    }

    /*******************************************************************
     * Track Download Event
     ******************************************************************/
    @Post(':id/downloaded')
    @ApiOperation({ summary: 'Track certificate download event' })
    @ApiParam({ name: 'id', description: 'Certificate ID' })
    @ApiOkResponse({ description: 'Download event tracked', type: CertificateResponseDto })
    @ApiNotFoundResponse({ description: 'Certificate not found' })
    async trackDownload(@Param('id') id: string) {
        this.logger.log(`Tracking download for certificate: ${id}`);
        const certificate = await this.certificateService.trackDownload(id);
        return {
            success: true,
            message: 'Download event tracked',
            data: certificate,
        };
    }

    /*******************************************************************
     * Get Certificate by UserGift ID
     ******************************************************************/
    @Get('user-gift/:userGiftId')
    @ApiOperation({ summary: 'Get certificate for a specific user gift' })
    @ApiParam({ name: 'userGiftId', description: 'User Gift ID' })
    @ApiOkResponse({ description: 'Certificate details', type: CertificateResponseDto })
    async getCertificateByUserGift(@Param('userGiftId') userGiftId: string) {
        const certificate = await this.certificateService.getCertificateByUserGiftId(userGiftId);
        return {
            success: true,
            data: certificate,
        };
    }

    /*******************************************************************
     * Delete Certificate by ID
     ******************************************************************/
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a certificate by ID' })
    @ApiParam({ name: 'id', description: 'Certificate ID' })
    @ApiOkResponse({ description: 'Certificate deleted successfully' })
    @ApiNotFoundResponse({ description: 'Certificate not found' })
    async deleteCertificate(@Param('id') id: string) {
        this.logger.log(`Deleting certificate: ${id}`);
        const result = await this.certificateService.deleteCertificate(id);
        return {
            success: true,
            ...result,
        };
    }

    /*******************************************************************
     * Delete Multiple Certificates
     ******************************************************************/
    @Delete('bulk/delete')
    @ApiOperation({ summary: 'Delete multiple certificates by IDs' })
    @ApiOkResponse({ description: 'Certificates deleted successfully' })
    async deleteCertificates(@Body() body: { ids: string[] }) {
        this.logger.log(`Deleting ${body.ids.length} certificates`);
        const result = await this.certificateService.deleteCertificates(body.ids);
        return {
            success: true,
            ...result,
        };
    }

    /*******************************************************************
     * Delete Certificate by UserGift ID
     ******************************************************************/
    @Delete('user-gift/:userGiftId')
    @ApiOperation({ summary: 'Delete certificate for a specific user gift' })
    @ApiParam({ name: 'userGiftId', description: 'User Gift ID' })
    @ApiOkResponse({ description: 'Certificate deleted successfully' })
    async deleteCertificateByUserGift(@Param('userGiftId') userGiftId: string) {
        this.logger.log(`Deleting certificate for UserGift: ${userGiftId}`);
        const result = await this.certificateService.deleteCertificateByUserGiftId(userGiftId);
        return {
            success: true,
            ...result,
        };
    }
}
