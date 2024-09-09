import { IsObject, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FileDTO {
    @IsOptional()
    @IsString()
    @ApiProperty()
    name: string;

    @IsOptional()
    @IsString()
    @ApiProperty()
    path: string;
}

export class SaveFileDTO {
    @IsOptional()
    @IsObject()
    @ApiProperty({ required: true, type: 'string', format: 'binary' })
    file: FileDTO;
}
