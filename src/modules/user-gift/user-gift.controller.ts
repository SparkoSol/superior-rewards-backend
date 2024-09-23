import { Body, Controller, Delete, Get, Param, Post, Query, Request } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserGiftService } from './user-gift.service';
import { UserGiftCreateRequest, UserGiftResponse } from './dto/user-gift.dto';
import { GiftStatus } from './enum/status.enum';

@ApiBearerAuth('access-token')
@ApiTags('UserGifts')
@Controller('user-gifts')
export class UserGiftController {
    constructor(private readonly service: UserGiftService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiNotAcceptableResponse({ description: '1: Invalid user id!, 2: Invalid gift id!' })
    @ApiOperation({ summary: 'To create gift' })
    @Post()
    async create(@Request() req: any, @Body() data: UserGiftCreateRequest): Promise<any> {
        return await this.service.create(data);
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiOkResponse({
        description: 'gift',
        type: UserGiftResponse,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get gift',
    })
    @ApiQuery({
        required: false,
        name: 'user',
        description: 'for getting all gifts of specific user',
    })
    @ApiQuery({
        required: false,
        name: 'gift',
        description: 'for getting all gifts of specific gift',
    })
    @ApiQuery({
        required: false,
        name: 'status',
        description: 'for getting all gifts of specific status',
    })
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @Get()
    async fetch(
        @Query('user') user?: string,
        @Query('gift') gift?: string,
        @Query('status') status?: GiftStatus,
        @Query('withPopulate') withPopulate?: boolean
    ): Promise<any> {
        return await this.service.fetch(user, gift, status, withPopulate);
    }

    /*******************************************************************
     * fetchAllGiftByUser
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiOperation({
        summary: 'To get gift w.r.t to userId',
    })
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @Get('byUserId/:user')
    async fetchAllGiftByUser(
        @Param('user') user?: string,
        @Query('withPopulate') withPopulate?: boolean
    ): Promise<any> {
        return await this.service.fetchAllGiftByUser(user, withPopulate);
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiNotFoundResponse({ description: 'No data found!' })
    @ApiOkResponse({
        description: 'UserGift by Id',
        type: UserGiftResponse,
    })
    @ApiOperation({
        summary: 'To get specific gift',
    })
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
     * update
     ******************************************************************/
    // @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    //   type: UserGiftResponse, description: 'UserGift Updated Successfully',
    // }) @ApiOperation({ summary: 'To update gift data' }) @Patch(':id')
    // async update(@Param('id') id: string, @Body() data: UserGiftUpdateRequest) {
    //   return await this.service.update(id, data);
    // }

    /*******************************************************************
     * delete
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiOkResponse({
        type: UserGiftResponse,
        description: 'UserGift Deleted Successfully',
    })
    @ApiOperation({
        summary: 'To delete an gift',
    })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(id);
    }
}
