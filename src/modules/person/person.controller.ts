import {
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
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
    PaginatedPersonResponseDto,
    PasswordUpdateRequestDto,
    PersonCreateDto,
    PersonFiltersDto,
    PersonQueryDto,
    PersonResponseDto,
    PersonUpdateDto,
    UpdateFcmTokenRequestDto,
} from './dto/person.dto';
import { PersonService } from './person.service';

@ApiBearerAuth('access-token')
@ApiTags('Person')
@Controller('persons')
export class PersonController {
    constructor(private readonly service: PersonService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiOkResponse({ type: PersonResponseDto, description: 'Customer Created Successfully' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBody({ type: PersonCreateDto })
    @ApiOperation({
        summary: 'To create customer user',
        description:
            'optional: odooCustomerId(for management users), dob, address, profilePicture, fcmTokens, deletedAt, email, country, customerNumber, performedBy, session',
    })
    @Post()
    async create(@Body() data: PersonCreateDto): Promise<any> {
        if (data.odooCustomerId) {
            const customer = await this.service.findOneByQuery({
                odooCustomerId: data.odooCustomerId,
            });
            if (customer)
                throw new ConflictException(
                    'Customer with the same customer number already exist in system!'
                );
        } else {
            data.odooCustomerId = await this.service.getLastOdooCustomerId();
        }

        return await this.service.create(data);
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    @ApiOkResponse({ type: PaginatedPersonResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBody({ type: PersonFiltersDto })
    @ApiOperation({
        summary: 'To get filtered persons  | ADMIN only',
        description:
            "optional => withPopulated, usedFor(users, customers) | filters: eq=>name[eq]: 'test', like=> tags[like]: 'test', range=> amount[range]: [min, max], date=> createdAt[date]: ['2021-01-01', '2021-01-31'], exists=> deletedAt[exists]: true",
    })
    @Post('filters')
    async filteredStories(@Body() data: PersonFiltersDto) {
        return this.service.filters(data);
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiOkResponse({
        description: 'To get persons',
        type: PaginatedPersonResponseDto,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get persons',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @Get()
    async fetch(@Query() data: PersonQueryDto): Promise<any> {
        const { page, pageSize, usedFor, withPopulate } = data;
        return await this.service.fetch(page, pageSize, usedFor, withPopulate);
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
     * updateFcmToken (PATCH)
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

    // /*******************************************************************
    //  * bulkUpload
    //  ******************************************************************/
    // @UseInterceptors(FileInterceptor('file'))
    // @ApiOperation({
    //     summary: 'bulk import customers form excel',
    //     description: 'Customers bulk uploading route for Admin',
    // })
    // @ApiConsumes('multipart/form-data')
    // @ApiBody({ type: BulkUploadDto })
    // @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    // @ApiInternalServerErrorResponse({ description: 'Invalid Role' })
    // @ApiOkResponse({ type: BulkUploadResponseDto })
    // @UseGuards(AuthGuard('jwt'))
    // @Post('bulk-upload')
    // async bulkUpload(@UploadedFile() file: any, @Res() res: Response) {
    //     return await this.service.bulkUpload(file, res);
    // }

    /*******************************************************************
     * update
     ******************************************************************/
    @ApiOkResponse({ type: PersonResponseDto, description: 'Person updated successfully' })
    @ApiOperation({
        summary: 'To update person data',
        description:
            'optional: odooCustomerId(for management users), dob, address, profilePicture, fcmTokens, deletedAt, email, country, customerNumber, session',
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
