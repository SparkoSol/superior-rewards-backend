import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsObject, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { filterPayload, populatedPayload } from '../../person/dto/person.dto';

export class GenerateCertificateDto {
    @ApiProperty({ description: 'User Gift ID for which to generate certificate' })
    @IsMongoId()
    @IsNotEmpty()
    userGiftId: string;

    @ApiProperty({ description: 'ID of the user generating the certificate (manager)' })
    @IsMongoId()
    @IsNotEmpty()
    generatedBy: string;

    @ApiPropertyOptional({
        description: `Points to dollar conversion rate (defaults to system setting)\n\n
        Note: Default points-to-dollars conversion rate is 0.01 (1 point = $0.01). Override via conversionRate parameter if needed.\n\n
        @default 0.01 - Default: 1 point = $0.01 (100 points = $1.00)\n\n
        @example 0.01 means 1000 points = $10.00\n\n
        @example 0.1 means 1000 points = $100.00`,
        example: 0.01,
        default: 0.01,
    })
    @IsNumber()
    @IsOptional()
    conversionRate?: number;
}

export class CertificateMetadataResponse {
    @ApiProperty()
    customerName: string;

    @ApiProperty()
    customerId: string;

    @ApiProperty()
    customerEmail: string;

    @ApiProperty()
    pointsRedeemed: number;

    @ApiProperty()
    monetaryValue: number;

    @ApiProperty()
    transactionId: string;

    @ApiProperty()
    redemptionDate: Date;
}

export class CertificateResponseDto {
    @ApiProperty()
    _id: string;

    @ApiProperty()
    certificateNumber: string;

    @ApiProperty()
    verificationCode: string;

    @ApiProperty()
    generatedAt: Date;

    @ApiPropertyOptional()
    downloadedAt?: Date;

    @ApiPropertyOptional()
    printedAt?: Date;

    @ApiProperty({ type: CertificateMetadataResponse })
    metadata: CertificateMetadataResponse;
}

export class VerifyCertificateResponseDto {
    @ApiProperty()
    isValid: boolean;

    @ApiPropertyOptional()
    certificateNumber?: string;

    @ApiPropertyOptional()
    customerName?: string;

    @ApiPropertyOptional()
    pointsRedeemed?: number;

    @ApiPropertyOptional()
    monetaryValue?: number;

    @ApiPropertyOptional()
    redemptionDate?: Date;

    @ApiPropertyOptional()
    generatedAt?: Date;

    @ApiPropertyOptional()
    message?: string;
}

export class MarkPrintedDto {
    @ApiProperty({ description: 'ID of the user marking the certificate as printed' })
    @IsMongoId()
    @IsNotEmpty()
    printedBy: string;
}

export class CertificateFiltersDto {
    @ApiProperty({ description: 'Page No - Starting Page is 1', default: 1 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page: number;

    @ApiProperty({ description: 'Page Size - Default is 10', default: 10 })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    pageSize: number;

    @ApiPropertyOptional({
        name: 'withPopulate',
        description: 'If true, will return populated data (generatedBy, userGiftId).',
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    withPopulate?: boolean;

    @ApiPropertyOptional({
        description:
            "Filter object - eq: name[eq]: 'test', like: certificateNumber[like]: 'CERT', range: pointsRedeemed[range]: [min, max], date: generatedAt[date]: ['2024-01-01', '2024-12-31'], exists: printedAt[exists]: true",
    })
    @IsOptional()
    @IsObject()
    filters?: filterPayload;

    @ApiPropertyOptional({
        description: 'PopulatedFilter object for filtering on populated fields',
    })
    @IsOptional()
    @IsObject()
    populated?: populatedPayload;
}

export class PaginatedCertificateResponseDto {
    @ApiPropertyOptional()
    filters?: filterPayload;

    @ApiProperty({ type: [CertificateResponseDto] })
    data: CertificateResponseDto[];

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
