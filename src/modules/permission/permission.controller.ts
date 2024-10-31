import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import {
    PermissionCreateRequest,
    PermissionResponse,
    PermissionUpdateRequest,
} from './dto/permission.dto';

@ApiBearerAuth('access-token')
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController {
    constructor(private readonly service: PermissionService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Error while creating Permission' })
    @ApiOperation({ summary: 'To create Permission' })
    @Post()
    async create(@Request() req: any, @Body() data: PermissionCreateRequest): Promise<any> {
        return await this.service.create(data);
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error!' })
    @ApiOkResponse({
        description: 'To get Permissions',
        type: PermissionResponse,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get Permissions',
    })
    @Get()
    async fetch(): Promise<any> {
        return await this.service.fetch();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiNotFoundResponse({ description: 'No data found!' })
    @ApiOkResponse({
        description: 'Permission by Id',
        type: PermissionResponse,
    })
    @ApiOperation({
        summary: 'To get specific Permission',
    })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.fetchById(id);
    }

    /*******************************************************************
     * update
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiOkResponse({
        type: PermissionResponse,
        description: 'Permission Updated Successfully',
    })
    @ApiOperation({ summary: 'To update Permission data' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: PermissionUpdateRequest) {
        return await this.service.update(id, data);
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiOkResponse({
        type: PermissionResponse,
        description: 'Permission Deleted Successfully',
    })
    @ApiOperation({
        summary: 'To delete an Permission',
    })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(id);
    }
}
