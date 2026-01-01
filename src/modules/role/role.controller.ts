import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import { RoleDto } from './dto/role.dto';

@ApiBearerAuth('access-token')
@ApiTags('Roles')
@Controller('roles')
export class RoleController {
    constructor(private readonly service: RoleService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Error while creating Role' })
    @ApiOperation({ summary: 'To create Role' })
    @Post()
    async create(@Body() data: RoleDto): Promise<any> {
        return await this.service.create(data);
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error!' })
    @ApiOkResponse({
        description: 'To get Roles',
        type: RoleDto,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get Roles',
    })
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
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiNotFoundResponse({ description: 'No data found!' })
    @ApiOkResponse({
        description: 'Role by Id',
        type: RoleDto,
    })
    @ApiOperation({
        summary: 'To get specific Role',
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
        type: RoleDto,
        description: 'Role Updated Successfully',
    })
    @ApiOperation({ summary: 'To update Role data' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: RoleDto) {
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
        type: RoleDto,
        description: 'Role Deleted Successfully',
    })
    @ApiOperation({
        summary: 'To delete an Role',
    })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(id);
    }
}
