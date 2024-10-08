import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiInternalServerErrorResponse,
    ApiNotAcceptableResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PasswordUpdateRequestDto, PersonResponseDto, PersonUpdateDto } from './dto/person.dto';
import { PersonService } from './person.service';

@ApiBearerAuth('access-token')
@ApiTags('Person')
@Controller('persons')
export class PersonController {
    constructor(private readonly service: PersonService) {}

    /*******************************************************************
     * fetch
     ******************************************************************/
    @ApiOkResponse({
        description: 'To get persons',
        type: PersonResponseDto,
        isArray: true,
    })
    @ApiOperation({
        summary: 'To get persons',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @Get()
    async fetch(): Promise<any> {
        return await this.service.fetch();
    }

    /*******************************************************************
     * fetchById
     ******************************************************************/
    @ApiOkResponse({ description: 'Person by Id', type: PersonResponseDto })
    @ApiOperation({
        summary: 'To get specific person',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiNotFoundResponse({ description: 'No data found!' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.fetchById(id);
    }

    /*******************************************************************
     * changePassword
     ******************************************************************/
    @ApiOkResponse({ description: 'Password updated successfully!' })
    @ApiOperation({ summary: 'To update specific person password!' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @ApiBadRequestResponse({ description: 'Issue in request data!' })
    @ApiNotAcceptableResponse({ description: 'Old Password Not Correct!' })
    @Patch('change-password')
    async changePassword(@Body() data: PasswordUpdateRequestDto): Promise<any> {
        return this.service.changePassword(data);
    }

    /*******************************************************************
     * update
     ******************************************************************/
    @ApiOkResponse({ type: PersonResponseDto, description: 'Person updated sccessfully' })
    @ApiOperation({ summary: 'To update person data' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() data: PersonUpdateDto) {
        return await this.service.update(id, data);
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    @ApiOkResponse({
        type: PersonResponseDto,
        description: 'Person deleted successfully',
    })
    @ApiOperation({
        summary: 'To delete an person',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors!' })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.service.delete(id);
    }
}
