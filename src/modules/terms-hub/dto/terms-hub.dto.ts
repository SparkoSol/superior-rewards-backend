import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TermsHubsType } from '../enum/type.enum';

export class TermsHubCreateDto {
    @ApiProperty({ default: TermsHubsType.POLICY })
    @IsEnum(TermsHubsType)
    @IsNotEmpty()
    type: number;

    @ApiProperty() @IsOptional() @IsString() details: string;
}

export class TermsHubUpdateDto extends PartialType(TermsHubCreateDto) {}

export class TermsHubsResponseDto {
    @ApiProperty({ default: TermsHubsType.POLICY })
    @IsEnum(TermsHubsType)
    @IsNotEmpty()
    type: number;

    @ApiProperty() @IsOptional() @IsString() details: string;
}
