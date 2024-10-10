import { IsEmpty, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class PermissionCreateRequest {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string;
}

export class PermissionUpdateRequest extends PartialType(PermissionCreateRequest) {}

export class PermissionResponse {
    @ApiProperty()
    name: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
