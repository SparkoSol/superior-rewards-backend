import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserGiftService } from '../user-gift/user-gift.service';
import { UserGiftTtlService } from './user-gift-ttl.service';

@Injectable()
export class UserGiftTtlJob {
    private readonly logger = new Logger(UserGiftTtlJob.name);

    constructor(
        @Inject(forwardRef(() => UserGiftService))
        private readonly userGiftService: UserGiftService,
        private readonly userGiftTtlService: UserGiftTtlService
    ) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron() {
        const allReferenceIds = await this.userGiftTtlService.getAllReferenceIdsInArray();

        const expiredUserGiftsIds =
            await this.userGiftService.getExpiredUserGiftsIds(allReferenceIds);

        if (expiredUserGiftsIds.length > 0) {
            this.logger.debug('Status updated!');
            this.userGiftService.updateStatusOfExpiredUserGifts(expiredUserGiftsIds);
        }
    }
}
