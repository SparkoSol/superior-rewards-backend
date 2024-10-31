import { Body, Controller, Get, Post } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
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
    @ApiOkResponse({ type: SettingResponse, description: 'Setting Created Successfully' })
    @ApiBody({ type: SettingRequest })
    @ApiOperation({ summary: 'To createOrUpdate settings' })
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
    })
    @ApiOperation({
        summary: 'To get settings',
    })
    @Get()
    async fetch(): Promise<any> {
        return await this.service.fetch();
    }
}
