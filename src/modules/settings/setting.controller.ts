import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Request } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth, ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation, ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SettingService } from './setting.service';
import { SettingRequest, SettingResponse } from './dto/setting.dto';

@ApiBearerAuth('access-token')
@ApiTags('Settings')
@Controller('settings')
export class SettingController {
    constructor(private readonly service: SettingService) {}

    /*******************************************************************
     * createOrUpdate
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Error while creating settings' })
    @ApiOkResponse({type: SettingResponse, description: 'Setting Created Successfully'})
    @ApiBody({ type: SettingRequest })
    @ApiOperation({ summary: 'To create settings' })
    @Post()
    async createOrUpdate(@Body() data: SettingRequest): Promise<any> {
        return await this.service.createOrUpdate(data);
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error!' })
    @ApiOkResponse({
        description: 'To get settings',
        type: SettingResponse,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get settings',
    })
    @ApiQuery({
        required: false,
        name: 'user',
        description: 'for getting all settings of specific user',
    })
    @Get()
    async fetch(@Query('user') user?: string,): Promise<any> {
        return await this.service.fetch(user);
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiNotFoundResponse({ description: 'No data found!' })
    @ApiOkResponse({
        description: 'Setting by Id',
        type: SettingResponse,
    })
    @ApiOperation({
        summary: 'To get specific settings',
    })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.fetchById(id);
    }
}
