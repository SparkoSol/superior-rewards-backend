import {
    Body,
    Controller,
    Delete,
    forwardRef,
    Get,
    HttpStatus,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
    BulkUploadDTO,
    PasswordUpdateRequestDto,
    PersonResponseDto,
    PersonUpdateDto,
    UpdateFcmTokenRequestDto,
} from './dto/person.dto';
import { PersonService } from './person.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { helper } from '../../utils/helper';
import { Response } from 'express';
import * as os from 'node:os';
import * as path from 'node:path';
import { RoleService } from '../role/role.service';
import { contains } from 'class-validator';

@ApiBearerAuth('access-token')
@ApiTags('Person')
@Controller('persons')
export class PersonController {
    constructor(
        private readonly service: PersonService,
        @Inject(forwardRef(() => RoleService))
        private readonly roleService: RoleService
    ) {}

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiOkResponse({
        description: 'To get persons',
        type: PersonResponseDto,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get persons',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @Get()
    async fetch(@Query('withPopulate') withPopulate?: boolean): Promise<any> {
        return await this.service.fetch(withPopulate);
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    @ApiOkResponse({ description: 'Person by Id', type: PersonResponseDto })
    @ApiOperation({
        summary: 'To get specific person',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiNotFoundResponse({ description: 'No data found!' })
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @Get(':id')
    findOne(@Param('id') id: string, @Query('withPopulate') withPopulate?: boolean) {
        return this.service.fetchById(id, withPopulate);
    }

    /*******************************************************************
     * changePassword
     ******************************************************************/
    @ApiOkResponse({ description: 'Password updated successfully!' })
    @ApiOperation({ summary: 'To update specific person password!' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @ApiBadRequestResponse({ description: 'Issue in request data!' })
    @ApiNotAcceptableResponse({ description: 'Old Password Not Correct!' })
    @Patch('change-password')
    async changePassword(@Body() data: PasswordUpdateRequestDto): Promise<any> {
        return this.service.changePassword(data);
    }

    /*******************************************************************
     * updateFcmToken (update a user's FCM token and subscribe to a notification channel)
     * - This API updates the FCM (Firebase Cloud Messaging) token for a user and subscribes
     *   the user to a notification channel.
     * - It first fetches the user (person) by their ID. If the user is not found, the function returns.
     * - The function determines the appropriate notification channel based on the environment:
     *   - In production, it uses the "news" channel.
     *   - In non-production environments, it uses the "news-staging" channel.
     * - The user's FCM token is then subscribed to the determined notification channel.
     * - The function checks if the user's FCM tokens array already contains the new token:
     *   - If the token does not exist in the array and the array has fewer than 10 tokens,
     *     it adds the new token.
     *   - If the array has 10 tokens, it removes the oldest token before adding the new one.
     * - If the user has no FCM tokens, a new array is created with the provided token.
     * - The updated user document is saved and returned.
     ******************************************************************/
    @ApiTags('Person')
    @ApiOkResponse({
        type: PersonResponseDto,
        description: 'Person Updated Successfully',
    })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiInternalServerErrorResponse({
        description: '1: Internal server errors, 2:Something went wrong while updating token.',
    })
    @Patch(':id/update-fcmToken')
    updateFcmToken(
        @Param('id') id: string,
        @Body() updateFcmTokenRequestDto: UpdateFcmTokenRequestDto
    ) {
        return this.service.updateFcmToken(id, updateFcmTokenRequestDto);
    }

    /*******************************************************************
     * bulkUpload
     ******************************************************************/
    @UseInterceptors(FileInterceptor('file'))
    @ApiOkResponse({ description: 'Upload CSV File' })
    @ApiOperation({ description: 'Contact bulk uploading route for Admin' })
    @ApiConsumes('multipart/form-data')
    @UseGuards(AuthGuard('jwt'))
    @Post('bulk-upload')
    async bulkUpload(@UploadedFile() file: any, @Body() data: BulkUploadDTO, @Res() res: Response) {
        const xlsDocsItems = [];
        let failedDocsCount = 0;

        const tempFilePath = path.join(os.tmpdir(), 'temp.csv');

        const fileData = Buffer.isBuffer(file) ? file : Buffer.from(file.buffer || file.data || '');

        fs.writeFileSync(tempFilePath, fileData);

        const sheetData = xlsx.utils.sheet_to_json(xlsx.readFile(tempFilePath).Sheets[xlsx.readFile(tempFilePath).SheetNames[0]]);

        const roleId = (await this.roleService.fetchByRoleName('User'))._id.toString();
        const lastOdooId = await this.service.getLastOdooCustomerId();

        if (!roleId) return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Invalid Role');

        console.log('Sheet Data: ', sheetData.length);

        // Process each row from the sheet data as you did with CSV
        for (let index = 0; index < sheetData.length; index++){
            const customer: any = sheetData[index];
            if (customer) {
                const defaultKeys = [
                    'Display Name',
                    'Phone',
                    'Country',
                    'Loyalty Points.',
                    'Customer Number',
                    'Complete Address',
                ];
                const csvKeys = Object.keys(customer);
                const isDefault = defaultKeys.some((key) => csvKeys.includes(key));
                if (!isDefault) {
                    throw new Error(
                        'Invalid File Format. Please check sample file format and try again.'
                    );
                }
            }
            if (customer['Phone'] && customer['Customer Number'] && customer['Display Name']) {
                xlsDocsItems.push({
                    name: helper.capitalizeFirstChar(customer['Display Name']),
                    phone: customer['Phone'].replace(/[\(\)-]/g, ''),
                    email: customer['Email'] ?? '',
                    country: customer['Country'] ?? '',
                    points: customer['Loyalty Points.'],
                    customerNumber: customer['Customer Number'],
                    address: customer['Complete Address'].replace(/[\n\r]/g, ''),
                    addedInOdoo: true,
                    role: roleId,
                    odooCustomerId: lastOdooId + (index + 1),
                });
            }
            else {
                failedDocsCount++;
            }
        }

        console.log('XLS Docs Items: ', xlsDocsItems.length);

        try {
            const successDocs = await this.service.createMany(xlsDocsItems);

            failedDocsCount = failedDocsCount + (xlsDocsItems.length - successDocs.length);

            res.status(HttpStatus.CREATED).send({
                totalDocs: xlsDocsItems.length,
                successDocs: successDocs.length,
                failedDocs: failedDocsCount,
            });
        } catch (e) {
            console.log('Error while bulk upload: ', e);
        }

        fs.unlinkSync(tempFilePath);
    }

    /*******************************************************************
     * update
     ******************************************************************/
    @ApiOkResponse({ type: PersonResponseDto, description: 'Person updated successfully' })
    @ApiOperation({
        summary: 'To update person data',
        description:
            'optional: odooCustomerId(for management users), dob, address, profilePicture, fcmTokens, deletedAt, email, country, customerNumber',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: PersonUpdateDto) {
        return await this.service.update(id, data);
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    @ApiOkResponse({
        type: PersonResponseDto,
        description: 'Person deleted successfully',
    })
    @ApiOperation({
        summary: 'To delete an person',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(id);
    }
}
