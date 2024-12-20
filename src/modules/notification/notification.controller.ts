import { Post, Body, Controller, Get, Param, Query, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
    NotificationResponseDto,
    NotificationPayloadForMultipleDeviceDto,
    NotificationPayload,
    NotificationCreateDto,
    NotificationFiltersDto,
    PaginatedNotificationResponseDto,
} from './dto/notification.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    /*******************************************************************
     * create
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Error while creating notification' })
    @ApiOperation({ summary: 'To create notification from admin' })
    @Post()
    async create(@Body() data: NotificationCreateDto): Promise<any> {
        return await this.notificationService.create(data);
    }

    /*******************************************************************
     * filters
     ******************************************************************/
    @ApiOkResponse({ type: PaginatedNotificationResponseDto })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiBody({ type: NotificationFiltersDto })
    @ApiOperation({
        summary: 'To get filtered notifications',
        description:
            "optional => withPopulated, usedId(mongoId), markAsRead(true|false) | filters: eq=>name[eq]: 'test', like=> tags[like]: 'test', range=> amount[range]: [min, max], date=> createdAt[date]: ['2021-01-01', '2021-01-31'], exists=> deletedAt[exists]: true",
    })
    @Post('filters')
    async filteredStories(@Body() data: NotificationFiltersDto) {
        return this.notificationService.filters(data);
    }

    /*******************************************************************
     * findAll
     ******************************************************************/
    @ApiOkResponse({
        type: [NotificationResponseDto],
        description: 'Data Found Successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiInternalServerErrorResponse({ description: 'Internal server error' })
    @ApiOperation({ description: 'Get All Data' })
    @ApiQuery({
        required: false,
        name: 'userId',
        description: 'Find all notifications by UserId',
    })
    @ApiQuery({
        required: false,
        name: 'markAsRead',
        description: 'For Getting all Read/UnRead notifications',
    })
    @Get()
    findAll(@Query('userId') userId: string, @Query('markAsRead') markAsRead?: boolean) {
        return this.notificationService.findAll(userId, markAsRead);
    }

    /*******************************************************************
     * findOne
     ******************************************************************/
    @ApiOkResponse({
        type: NotificationResponseDto,
        description: 'Data Found Successfully',
    })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiInternalServerErrorResponse({ description: 'Internal server errors' })
    @ApiNotFoundResponse({ description: 'What You Are Looking For Not Found' })
    @ApiOperation({ description: 'Get Specific Data' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.notificationService.findOne(id);
    }

    /*******************************************************************
     * sendNotificationToSingleDevice
     ******************************************************************/
    @ApiBody({ type: NotificationPayload })
    @ApiOkResponse({ description: 'Notification send successfully!' })
    @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
    @ApiNotFoundResponse({
        description: 'Invalid FCM token, no user associate with it',
    })
    @ApiOperation({ description: 'Send notification to channel!' })
    @ApiParam({ type: String, description: 'FCM token', name: 'fcmToken' })
    @Post(':fcmToken/send-to-single-device')
    async sendNotificationToSingleDevice(
        @Param('fcmToken') fcmToken: string,
        @Body() data: NotificationPayload
    ) {
        return await this.notificationService.sendNotificationFromApiToSingleDevice(fcmToken, data);
    }

    /*******************************************************************
     * sendNotificationToMultipleDevices
     ******************************************************************/
    @ApiOkResponse({ description: 'Notifications send successfully!' })
    @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
    @ApiOperation({ description: 'Send Notification to multiple devices' })
    @ApiBody({ type: NotificationPayloadForMultipleDeviceDto })
    @Post('/send-to-multiple-devices')
    async sendNotificationToMultipleDevices(@Body() data: NotificationPayloadForMultipleDeviceDto) {
        const { title, body, fcmTokens } = data;
        return this.notificationService.sendNotificationToMultipleDevices(fcmTokens, title, body);
    }

    /*******************************************************************
     * sendNotificationToChannel
     ******************************************************************/
    @ApiOkResponse({ description: 'Notification send successfully!' })
    @ApiBody({ type: NotificationPayload })
    @ApiInternalServerErrorResponse({ description: 'Something went wrong' })
    @ApiOperation({ description: 'Send Notification to Channel' })
    @ApiParam({ type: String, description: 'Channel Name', name: 'channel' })
    @Post('/send-to-channel/:channel')
    async sendNotificationToChannel(
        @Param('channel') channel: string,
        @Body() data: NotificationPayload
    ) {
        return this.notificationService.sendNotificationToChannel(channel, data);
    }

    /*******************************************************************
     * delete
     ******************************************************************/
    @ApiUnauthorizedResponse({ description: 'Unauthorized!' })
    @ApiInternalServerErrorResponse({ description: 'Unexpected Error' })
    @ApiOperation({
        summary: 'To delete a notification',
    })
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.notificationService.delete(id);
    }
}
