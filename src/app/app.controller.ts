import {
    Body,
    Controller,
    Get,
    InternalServerErrorException,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { DeleteFileDTO, FileDTO, SaveFileDTO } from '../uploadFileStructue/dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../modules/auth/decorators/setmetadata.decorator';
import { getDownloadURL } from 'firebase-admin/storage';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    /*******************************************************************
     * saveFile
     ******************************************************************/
    @ApiBearerAuth('access-token')
    @ApiTags('FileUpload')
    @ApiCreatedResponse({
        type: FileDTO,
        description: 'File Saved Successfully',
    })
    @ApiOperation({ summary: 'Save File' })
    @ApiBody({ type: SaveFileDTO })
    @ApiConsumes('multipart/form-data')
    @Post('save')
    @UseInterceptors(FileInterceptor('file'))
    async saveFile(@UploadedFile() file: Express.Multer.File): Promise<FileDTO> {
        const uploaded_file = await this.appService.uploadFile(file);
        const downloadURL = await getDownloadURL(uploaded_file);

        return {
            id: uploaded_file.id.split('%2F').join('/'),
            path: downloadURL,
        };
    }

    /*******************************************************************
     * deleteFile
     ******************************************************************/
    @ApiBearerAuth('access-token')
    @ApiTags('FileUpload')
    @ApiOkResponse({ description: 'File deleted Successfully' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @Post('delete-file')
    async deleteFile(@Body() data: DeleteFileDTO) {
        // const imagePath = ImageUtils.imagePath + '/' + name;
        // try {
        //     ImageUtils.deleteImages(imagePath, true);
        //     return { status: 200, message: 'File deleted Successfully' };
        // } catch (error) {
        //     throw new InternalServerErrorException(error);
        // }

        try {
            await this.appService.deleteFile(data.id);
            return { status: 200, message: 'File deleted Successfully' };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
