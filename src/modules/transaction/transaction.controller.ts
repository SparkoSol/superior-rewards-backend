import { Body, Controller, Delete, Get, Param, Post, Request } from '@nestjs/common';
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
import { TransactionService } from './transaction.service';
import { TransactionCreateRequest, TransactionResponse } from './dto/transaction.dto';

@ApiBearerAuth('access-token')
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
    constructor(private readonly service: TransactionService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiOperation({ summary: 'To create transaction' })
    @Post()
    async create(@Request() req: any, @Body() data: TransactionCreateRequest): Promise<any> {
        return await this.service.create(data);
    }

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBadRequestResponse({ description: 'Issue in request data' })
    @ApiOkResponse({
        description: 'To get transactions',
        type: TransactionResponse,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get transactions',
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
        description: 'Transaction by Id',
        type: TransactionResponse,
    })
    @ApiOperation({
        summary: 'To get specific transaction',
    })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.fetchById(id);
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    // @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    //   type: TransactionResponse, description: 'Transaction Deleted Successfully',
    // }) @ApiOperation({
    //   summary: 'To delete an transaction',
    // }) @Delete(':id')
    // async delete(@Param('id') id: string) {
    //   return await this.service.delete(id);
    // }
}
