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
import { GiftService } from './gift.service';
import { GiftCreateRequest, GiftResponse, GiftUpdateRequest } from './dto/gift.dto';

@ApiBearerAuth('access-token') @ApiTags('Gifts') @Controller('gifts')
export class GiftController {
  constructor(private readonly service: GiftService) {
  }

  /*******************************************************************
   * create
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiOperation({ summary: 'To create gift' }) @Post()
  async create(@Request() req: any, @Body() data: GiftCreateRequest): Promise<any> {
    return await this.service.create(data);
  }

  /*******************************************************************
   * fetch
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    description: 'gift', type: GiftResponse, isArray: true,
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
    description: 'Gift by Id', type: GiftResponse,
  }) @ApiOperation({
    summary: 'To get specific gift',
  }) @Get(':id') findOne(@Param('id') id: string) {
    return this.service.fetchById(id);
  }

  /*******************************************************************
   * update
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    type: GiftResponse, description: 'Gift Updated Successfully',
  }) @ApiOperation({ summary: 'To update gift data' }) @Patch(':id')
  async update(@Param('id') id: string, @Body() data: GiftUpdateRequest) {
    return await this.service.update(id, data);
  }

  /*******************************************************************
   * delete
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    type: GiftResponse, description: 'Gift Deleted Successfully',
  }) @ApiOperation({
    summary: 'To delete an gift',
  }) @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
