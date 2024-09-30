import {
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import {
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { FileDTO, SaveFileDTO } from '../uploadFileStructue/dto/file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageUtils } from '../utils/image-utils';
import { Public } from '../modules/auth/decorators/setmetadata.decorator';

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
    @Public()
    @ApiTags('FileUpload')
    @ApiCreatedResponse({
        type: FileDTO,
        description: 'File Saved Successfully',
    })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBody({ type: SaveFileDTO })
    @ApiConsumes('multipart/form-data')
    @Post('save-file')
    @UseInterceptors(FileInterceptor('file'))
    saveFile(@UploadedFile() file): any {
<<<<<<< Updated upstream
        console.log('file: ', file);
        if (file) return { name: file.filename, path: file.path };
        else return {};
=======
        try {
            if (file) return { name: file.filename, path: file.path };
            else return {};
        } catch (error) {
            throw new InternalServerErrorException(error);
        }

>>>>>>> Stashed changes
    }

    /*******************************************************************
     * deleteFile
     ******************************************************************/
    @Public()
    @ApiTags('FileUpload')
    @ApiOkResponse({ description: 'File deleted Successfully' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiParam({
        name: 'name',
        type: 'String',
        required: true,
    })
    @Post('delete-file/:name')
    deleteFile(@Param('name') name: string): any {
        const imagePath = ImageUtils.imagePath + '/' + name;
        try {
            ImageUtils.deleteImages(imagePath, true);
            return { status: 200, message: 'File deleted Successfully' };
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
