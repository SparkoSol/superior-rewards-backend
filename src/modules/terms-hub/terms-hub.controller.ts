import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { TermsHubService } from './terms-hub.service';
import {
    ApiBearerAuth,
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TermsHubCreateDto, TermsHubsResponseDto } from './dto/terms-hub.dto';
import { TermsHubsType } from './enum/type.enum';

@ApiBearerAuth('access-token')
@ApiTags('TermsHub')
@Controller('terms-hub')
export class TermsHubController {
    constructor(private readonly termsHubService: TermsHubService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiOkResponse({
        type: TermsHubsResponseDto,
        description: 'Data Created Successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiInternalServerErrorResponse({ description: 'Error while creating terms-hub' })
    @ApiOperation({
        description: `type: ${Object.values(TermsHubsType)}, optional: details`,
    })
    @ApiBody({ type: TermsHubCreateDto })
    @Post()
    create(@Body() TermsHubCreateDto: TermsHubCreateDto) {
        return this.termsHubService.create(TermsHubCreateDto);
    }

    /*******************************************************************
     * findAll
     ******************************************************************/
    @ApiOkResponse({
        type: [TermsHubsResponseDto],
        description: 'Data Found Successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiInternalServerErrorResponse({ description: 'Error while getting terms-hubs' })
    @ApiOperation({ description: 'Get All Data' })
    @ApiQuery({
        required: false,
        name: 'type',
        description: 'Find all items w.r.t type',
    })
    @Get()
    findAll(@Query('type') type: string) {
        return this.termsHubService.findAll(type);
    }

    /*******************************************************************
     * findOne
     ******************************************************************/
    @ApiOkResponse({
        type: TermsHubsResponseDto,
        description: 'Data Found Successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiNotFoundResponse({ description: 'What You Are Looking For Not Found' })
    @ApiOperation({ description: 'Get Specific Data' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.termsHubService.findOne(id);
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    @ApiOkResponse({
        type: TermsHubsResponseDto,
        description: 'Data Deleted Successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiInternalServerErrorResponse({ description: 'Error while deleting terms-hub' })
    @ApiNotFoundResponse({
        description: 'Data You are Trying to Delete Not Existed',
    })
    @ApiOperation({ description: 'Delete Specific Data' })
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.termsHubService.remove(id);
    }
}
