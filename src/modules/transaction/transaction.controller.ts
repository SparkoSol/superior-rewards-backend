import { Body, Controller, Get, Param, Post, Query, Request } from '@nestjs/common';
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
import { TransactionService } from './transaction.service';
import {
    PaginatedTransactionResponseDto,
    TransactionCreateRequest,
    TransactionFiltersDto,
    TransactionResponse,
} from './dto/transaction.dto';
import { TransactionType } from './enum/type.enum';

@ApiBearerAuth('access-token')
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
    constructor(private readonly service: TransactionService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiOkResponse({ type: TransactionResponse, description: 'Transaction Created Successfully' })
    @ApiNotAcceptableResponse({ description: 'Invoice No already exists!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiOperation({
        summary: 'To create transaction',
        description: `type: ${Object.values(TransactionType)}, optional: invoiceNo, amount, details`,
    })
    @Post()
    async create(@Request() req: any, @Body() data: TransactionCreateRequest): Promise<any> {
        return await this.service.create(data);
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    @ApiOkResponse({ type: PaginatedTransactionResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBody({ type: TransactionFiltersDto })
    @ApiOperation({
        summary: 'To get filtered transactions | ADMIN only',
        description:
            "optional => withPopulated, markAsRead(true|false) | filters: eq=>name[eq]: 'test', like=> tags[like]: 'test', range=> amount[range]: [min, max], date=> createdAt[date]: ['2021-01-01', '2021-01-31'], exists=> deletedAt[exists]: true",
    })
    @Post('filters')
    async filteredStories(@Body() data: TransactionFiltersDto) {
        return this.service.filters(data);
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
    @ApiQuery({
        required: false,
        name: 'user',
        description: 'for getting all transactions of specific user',
    })
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @Get()
    async fetch(
        @Query('user') user?: string,
        @Query('withPopulate') withPopulate?: boolean
    ): Promise<any> {
        return await this.service.fetch(user, withPopulate);
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
    @ApiQuery({
        required: false,
        name: 'withPopulate',
        description: 'If true, will return populated data.',
    })
    @Get(':id')
    findOne(@Param('id') id: string, @Query('withPopulate') withPopulate: boolean) {
        return this.service.fetchById(id, withPopulate);
    }
}
