import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse, ApiBearerAuth,
  ApiInternalServerErrorResponse, ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation, ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PasswordUpdateRequestDto, PersonResponseDto, PersonUpdateDto } from './dto/person.dto';
import { PersonService } from './person.service';

@ApiBearerAuth('access-token')
@ApiTags('Person')
@Controller('persons')
export class PersonController {
  constructor(private readonly service: PersonService) {
  }

  /*******************************************************************
   * fetch
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    description: 'transaction', type: PersonResponseDto, isArray: true,
  }) @ApiOperation({
    summary: 'To get transaction',
  }) @Get()
  async fetch(): Promise<any> {
    return await this.service.fetch();
  }

  /*******************************************************************
   * fetchById
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Internal Server Error' }) @ApiNotFoundResponse({ description: 'No data found!' }) @ApiOkResponse({
    description: 'Person by Id', type: PersonResponseDto,
  }) @ApiOperation({
    summary: 'To get specific transaction',
  }) @Get(':id') findOne(@Param('id') id: string) {
    return this.service.fetchById(id);
  }

  /*******************************************************************
   * changePassword
   ******************************************************************/
  @ApiOkResponse({ description: 'Password Updated Successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({
    description:
      '1:Internal server errors, 2:Something went wrong while updating password',
  })
  @ApiBadRequestResponse({ description: 'Issue in request data' })
  @ApiNotAcceptableResponse({ description: 'Old Password Not Correct!' })
  @Patch('change-password')
  async changePassword(@Body() data: PasswordUpdateRequestDto): Promise<any> {
    return this.service.changePassword(data);
  }

  /*******************************************************************
   * update
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    type: PersonResponseDto, description: 'Person Updated Successfully',
  }) @ApiOperation({ summary: 'To update transaction data' }) @Patch(':id')
  async update(@Param('id') id: string, @Body() data: PersonUpdateDto) {
    return await this.service.update(id, data);
  }

  /*******************************************************************
   * delete
   ******************************************************************/
  @ApiUnauthorizedResponse({ description: 'Unauthorized!' }) @ApiInternalServerErrorResponse({ description: 'Unexpected Error' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiBadRequestResponse({ description: 'Issue in request data' }) @ApiOkResponse({
    type: PersonResponseDto, description: 'Person Deleted Successfully',
  }) @ApiOperation({
    summary: 'To delete an transaction',
  }) @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.service.delete(id);
  }
}
