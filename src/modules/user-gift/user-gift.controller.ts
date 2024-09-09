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
import { UserGiftService } from './user-gift.service';
import { UserGiftCreateRequest, UserGiftResponse, UserGiftUpdateRequest } from './dto/user-gift.dto';

@ApiBearerAuth('access-token') @ApiTags('UserGifts') @Controller('user-gifts')
export class UserGiftController {
  constructor(private readonly service: UserGiftService) {
  }

  /*******************************************************************
   * create
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiOperation({ summary: 'To create gift' }) @Post()
  async create(@Request() req: any, @Body() data: UserGiftCreateRequest): Promise<any> {
    return await this.service.create(data);
  }

  /*******************************************************************
   * fetch
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    description: 'gift', type: UserGiftResponse, isArray: true,
  }) @ApiOperation({
    summary: 'To get gift',
  }) @Get()
  async fetch(): Promise<any> {
    return await this.service.fetch();
  }

  /*******************************************************************
   * fetchById
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Internal Server Error' }) @ApiNotFoundResponse({ description: 'No data found!' }) @ApiOkResponse({
    description: 'UserGift by Id', type: UserGiftResponse,
  }) @ApiOperation({
    summary: 'To get specific gift',
  }) @Get(':id') findOne(@Param('id') id: string) {
    return this.service.fetchById(id);
  }

  /*******************************************************************
   * update
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    type: UserGiftResponse, description: 'UserGift Updated Successfully',
  }) @ApiOperation({ summary: 'To update gift data' }) @Patch(':id')
  async update(@Param('id') id: string, @Body() data: UserGiftUpdateRequest) {
    return await this.service.update(id, data);
  }

  /*******************************************************************
   * delete
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    type: UserGiftResponse, description: 'UserGift Deleted Successfully',
  }) @ApiOperation({
    summary: 'To delete an gift',
  }) @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
