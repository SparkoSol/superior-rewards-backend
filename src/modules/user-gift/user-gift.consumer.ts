import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UserGiftService } from './user-gift.service';

@Processor('user-gift-queue')
export class UserGiftConsumer extends WorkerHost {
    constructor(private readonly userGiftService: UserGiftService) {
        super();
    }

    async process(job: Job): Promise<any> {
        console.log('Processing job', job.id, job.data);

        if (job.data) {
            await this.userGiftService.update(job.data._id.toString(), {
                isExpired: true,
            });
        }
    }
}
