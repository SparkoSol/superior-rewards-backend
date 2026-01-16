import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Certificate, CertificateDocument } from './schema/certificate.schema';
import { CertificatePdfService, CertificateData } from './certificate-pdf.service';
import { UserGift, UserGiftDocument } from '../user-gift/schema/user-gift.schema';
import { Person, PersonDocument } from '../person/schema/person.schema';
import { CertificateFiltersDto, VerifyCertificateResponseDto } from './dto/certificate.dto';
import { MongoQueryUtils } from '../../utils/mongo-query-utils';
import { randomUUID } from 'crypto';

@Injectable()
export class CertificateService {
    private readonly logger = new Logger(CertificateService.name);

    constructor(
        @InjectModel(Certificate.name)
        private readonly certificateModel: Model<CertificateDocument>,
        @InjectModel(UserGift.name) private readonly userGiftModel: Model<UserGiftDocument>,
        @InjectModel(Person.name) private readonly personModel: Model<PersonDocument>,
        private readonly pdfService: CertificatePdfService
    ) {}

    /**
     * Generate a certificate for a completed redemption
     */
    async generateCertificate(
        userGiftId: string,
        generatedById: string,
        conversionRate: number = 0.01 // Default: 1 point = $0.01
    ): Promise<CertificateDocument> {
        try {
            // Fetch user gift with populated user and gifts
            const userGift = (await this.userGiftModel
                .findById(userGiftId)
                .populate(['user', 'gifts'])
                .exec()) as any;

            if (!userGift) {
                throw new NotFoundException(`UserGift with ID ${userGiftId} not found`);
            }

            // Fetch the generator (manager)
            const generator = await this.personModel.findById(generatedById).exec();
            if (!generator) {
                throw new NotFoundException(`Generator with ID ${generatedById} not found`);
            }

            // Generate unique identifiers
            const certificateNumber = await this.generateCertificateNumber();
            const verificationCode = randomUUID();

            // Calculate monetary value
            const pointsRedeemed = userGift.totalPoints || 0;
            const monetaryValue = pointsRedeemed * conversionRate;

            // Prepare certificate data
            const certificateData: CertificateData = {
                certificateNumber,
                customerName: userGift.user?.name || 'Unknown Customer',
                customerId: userGift.user?._id?.toString() || userGiftId,
                customerEmail: userGift.user?.email || '',
                pointsRedeemed,
                monetaryValue,
                transactionId: userGiftId,
                redemptionDate: userGift.updatedAt || new Date(),
                printedBy: generator.name || 'System',
                printDate: new Date(),
                verificationCode,
            };

            // Generate HTML content
            const htmlContent = this.pdfService.renderTemplate(certificateData);

            // Create certificate record
            const certificate = new this.certificateModel({
                userGiftId,
                certificateNumber,
                verificationCode,
                htmlContent,
                generatedBy: generatedById,
                generatedAt: new Date(),
                metadata: {
                    customerName: certificateData.customerName,
                    customerId: certificateData.customerId,
                    customerEmail: certificateData.customerEmail,
                    pointsRedeemed,
                    monetaryValue,
                    transactionId: userGiftId,
                    redemptionDate: certificateData.redemptionDate,
                },
            });

            await certificate.save();

            this.logger.log(
                `Certificate ${certificateNumber} generated for UserGift ${userGiftId}`
            );

            return certificate;
        } catch (error) {
            this.logger.error(`Error generating certificate: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Get certificate by ID
     */
    async getCertificateById(id: string): Promise<CertificateDocument> {
        const certificate = await this.certificateModel.findById(id).exec();
        if (!certificate) {
            throw new NotFoundException(`Certificate with ID ${id} not found`);
        }
        return certificate;
    }

    /**
     * Get certificate by certificate number
     */
    async getCertificateByNumber(certificateNumber: string): Promise<CertificateDocument> {
        const certificate = await this.certificateModel.findOne({ certificateNumber }).exec();
        if (!certificate) {
            throw new NotFoundException(`Certificate ${certificateNumber} not found`);
        }
        return certificate;
    }

    /**
     * Get certificates for a user gift
     */
    async getCertificateByUserGiftId(userGiftId: string): Promise<CertificateDocument | null> {
        return this.certificateModel.findOne({ userGiftId }).exec();
    }

    /**
     * Get all certificates for a customer
     */
    async getCertificatesByCustomer(userId: string): Promise<CertificateDocument[]> {
        // Find all user gifts for this user
        const userGifts = await this.userGiftModel.find({ user: userId }).exec();
        const userGiftIds = userGifts.map((ug) => ug._id);

        return this.certificateModel
            .find({ userGiftId: { $in: userGiftIds } })
            .sort({ generatedAt: -1 })
            .exec();
    }

    /**
     * Filter certificates with pagination and dynamic filters
     */
    async filters(data: CertificateFiltersDto) {
        const { page = 1, pageSize = 10, filters, populated, withPopulate } = data;
        const skip = (page - 1) * pageSize;

        let query = {};
        if (filters) {
            query = MongoQueryUtils.getQueryFromFilters(filters);
        }

        const pipeline: any[] = [{ $match: query }];

        // Add lookups for populating related collections if needed
        if (withPopulate) {
            pipeline.push(
                // Lookup generatedBy (Person)
                {
                    $lookup: {
                        from: 'people',
                        localField: 'generatedBy',
                        foreignField: '_id',
                        as: 'generatedBy',
                    },
                },
                {
                    $unwind: {
                        path: '$generatedBy',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                // Lookup userGiftId (UserGift)
                {
                    $lookup: {
                        from: 'usergifts',
                        localField: 'userGiftId',
                        foreignField: '_id',
                        as: 'userGift',
                    },
                },
                {
                    $unwind: {
                        path: '$userGift',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                // Lookup user from userGift
                {
                    $lookup: {
                        from: 'people',
                        localField: 'userGift.user',
                        foreignField: '_id',
                        as: 'customer',
                    },
                },
                {
                    $unwind: {
                        path: '$customer',
                        preserveNullAndEmptyArrays: true,
                    },
                }
            );

            // Add dynamic match stages for populated fields
            if (populated) {
                const populatedMatchStages = MongoQueryUtils.createDynamicMatchStages(populated);
                pipeline.push(...populatedMatchStages);
            }
        }

        // Use $facet for pagination and count in single query
        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $sort: { generatedAt: -1 } },
                    { $skip: skip },
                    { $limit: pageSize },
                ],
                totalCount: [{ $count: 'count' }],
            },
        });

        const result = await this.certificateModel.aggregate(pipeline).exec();

        const certificates = result[0].paginatedResults;
        const totalCount = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
            data: certificates,
            page,
            pageSize: certificates.length,
            totalPages,
            filters,
        };
    }

    /**
     * Download certificate as PDF
     */
    async downloadCertificate(id: string): Promise<Buffer> {
        const certificate = await this.getCertificateById(id);

        // Fetch generator name
        const generator = await this.personModel.findById(certificate.generatedBy).exec();

        // Prepare data for PDF
        const certificateData: CertificateData = {
            certificateNumber: certificate.certificateNumber,
            customerName: certificate.metadata.customerName,
            customerId: certificate.metadata.customerId,
            customerEmail: certificate.metadata.customerEmail,
            pointsRedeemed: certificate.metadata.pointsRedeemed,
            monetaryValue: certificate.metadata.monetaryValue,
            transactionId: certificate.metadata.transactionId,
            redemptionDate: certificate.metadata.redemptionDate,
            printedBy: generator?.name || 'System',
            printDate: new Date(),
            verificationCode: certificate.verificationCode,
        };

        // Generate PDF
        const pdfBuffer = await this.pdfService.generatePdf(certificateData);

        // Track download if first time
        // if (!certificate.downloadedAt) {
        await this.certificateModel.findByIdAndUpdate(id, {
            downloadedAt: new Date(),
        });
        this.logger.log(`Certificate ${certificate.certificateNumber} downloaded for first time`);
        // }

        return pdfBuffer;
    }

    /**
     * Mark certificate as printed
     */
    async markAsPrinted(id: string): Promise<CertificateDocument> {
        const certificate = await this.certificateModel.findByIdAndUpdate(
            id,
            { printedAt: new Date() },
            { new: true }
        );

        if (!certificate) {
            throw new NotFoundException(`Certificate with ID ${id} not found`);
        }

        this.logger.log(`Certificate ${certificate.certificateNumber} marked as printed`);
        return certificate;
    }

    /**
     * Track download event
     */
    async trackDownload(id: string): Promise<CertificateDocument> {
        const certificate = await this.certificateModel.findByIdAndUpdate(
            id,
            { downloadedAt: new Date() },
            { new: true }
        );

        if (!certificate) {
            throw new NotFoundException(`Certificate with ID ${id} not found`);
        }

        return certificate;
    }

    /**
     * Verify certificate by verification code
     */
    async verifyCertificate(verificationCode: string): Promise<VerifyCertificateResponseDto> {
        const certificate = await this.certificateModel.findOne({ verificationCode }).exec();

        if (!certificate) {
            return {
                isValid: false,
                message: 'Certificate not found or verification code is invalid',
            };
        }

        return {
            isValid: true,
            certificateNumber: certificate.certificateNumber,
            customerName: certificate.metadata.customerName,
            pointsRedeemed: certificate.metadata.pointsRedeemed,
            monetaryValue: certificate.metadata.monetaryValue,
            redemptionDate: certificate.metadata.redemptionDate,
            generatedAt: certificate.generatedAt,
        };
    }

    /**
     * Generate unique certificate number
     */
    private async generateCertificateNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `CERT-${year}-`;

        // Find the last certificate of this year
        const lastCertificate = await this.certificateModel
            .findOne({ certificateNumber: { $regex: `^${prefix}` } })
            .sort({ certificateNumber: -1 })
            .exec();

        let nextNumber = 1;
        if (lastCertificate) {
            const lastNum = parseInt(lastCertificate.certificateNumber.replace(prefix, ''), 10);
            nextNumber = lastNum + 1;
        }

        return `${prefix}${String(nextNumber).padStart(6, '0')}`;
    }

    /**
     * Delete a certificate by ID
     */
    async deleteCertificate(id: string): Promise<{ deleted: boolean; message: string }> {
        const certificate = await this.certificateModel.findByIdAndDelete(id).exec();

        if (!certificate) {
            throw new NotFoundException(`Certificate with ID ${id} not found`);
        }

        this.logger.log(`Certificate ${certificate.certificateNumber} deleted`);
        return {
            deleted: true,
            message: `Certificate ${certificate.certificateNumber} has been deleted`,
        };
    }

    /**
     * Delete multiple certificates by IDs
     */
    async deleteCertificates(ids: string[]): Promise<{ deleted: number; message: string }> {
        const result = await this.certificateModel.deleteMany({ _id: { $in: ids } }).exec();

        this.logger.log(`${result.deletedCount} certificates deleted`);
        return {
            deleted: result.deletedCount,
            message: `${result.deletedCount} certificate(s) have been deleted`,
        };
    }

    /**
     * Delete certificate by user gift ID
     */
    async deleteCertificateByUserGiftId(
        userGiftId: string
    ): Promise<{ deleted: boolean; message: string }> {
        const certificate = await this.certificateModel.findOneAndDelete({ userGiftId }).exec();

        if (!certificate) {
            return {
                deleted: false,
                message: `No certificate found for UserGift ${userGiftId}`,
            };
        }

        this.logger.log(
            `Certificate ${certificate.certificateNumber} deleted for UserGift ${userGiftId}`
        );
        return {
            deleted: true,
            message: `Certificate ${certificate.certificateNumber} has been deleted`,
        };
    }
}
