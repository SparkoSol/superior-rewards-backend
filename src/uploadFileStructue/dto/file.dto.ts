import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileDTO {
    @IsString()
    @ApiProperty()
    id: string;

    @IsString()
    @IsOptional()
    @ApiProperty()
    path: string;
}

export class SaveFileDTO {
    @IsOptional()
    @IsObject()
    @ApiProperty({ required: true, type: 'string', format: 'binary' })
    file: FileDTO;
}

export class DeleteFileDTO {
    @IsString()
    @ApiProperty()
    id: string;
}
