import {
    IsBoolean,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../enum/type.enum';
import { Type } from 'class-transformer';
import { filterPayload, populatedPayload } from '../../person/dto/person.dto';

export class TransactionCreateRequest {
    @ApiProperty() @IsNotEmpty() @IsString() @IsMongoId() user: string;

    @ApiProperty() @IsNotEmpty() @IsString() customerPhone: string;

    @ApiProperty() @IsOptional() @IsString() invoiceNo?: string;

    @ApiProperty({ default: 0 }) @IsOptional() @IsNumber() amount?: number;

    @ApiProperty({ default: 0 }) @IsNotEmpty() @IsNumber() points: number;

    @ApiProperty() @IsOptional() @IsString() details?: string;

    @ApiProperty({
        required: true,
        type: String,
        default: TransactionType.CREDIT,
    })
    @IsNotEmpty()
    @IsEnum(TransactionType, {
        message: 'type must be ' + Object.values(TransactionType).join(', '),
    })
    type: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsMongoId()
    performedBy?: string;
}

export class TransactionResponse {
    @ApiProperty() user: object;

    @ApiProperty() customerPhone: string;

    @ApiProperty() invoiceNo?: string;

    @ApiProperty({ default: 0 }) amount?: number;

    @ApiProperty({ default: 0 }) points: number;

    @ApiProperty({
        required: true,
        type: String,
        default: TransactionType.CREDIT,
    })
    type: string;

    @ApiProperty()
    performedBy?: object;

    @ApiProperty() details?: string;

    @ApiProperty() createdAt: Date;

    @ApiProperty() updatedAt: Date;
}

export class TransactionFiltersDto {
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

    @ApiProperty({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    withPopulate?: boolean;

    @ApiProperty({
        required: false,
        name: 'user',
        description: 'Find all transactions by UserId',
    })
    @IsOptional()
    @IsString()
    user?: string;

    @ApiProperty({ description: 'Filter object' })
    @IsOptional()
    @IsObject()
    // filters?: Record<string, any>;
    filters?: filterPayload;

    @ApiProperty({ description: 'PopulatedFilter object' })
    @IsOptional()
    @IsObject()
    populated?: populatedPayload;
}

export class PaginatedTransactionResponseDto {
    @ApiProperty()
    filters?: filterPayload;

    @ApiProperty({ type: [TransactionResponse] })
    data: [TransactionResponse];

    @ApiProperty()
    page: number;

    @ApiProperty()
    pageSize: number;

    @ApiProperty()
    totalPages: number;
}
