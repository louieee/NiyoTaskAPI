import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { deleteAllFiles } from './common.helpers';

@Injectable()
export class CommonCronServices {
  private readonly logger = new Logger(CommonCronServices.name);

  @Cron('45 * * * * *')
  async handleCron() {
    // this.logger.debug('Called when the current second is 45');
    await deleteAllFiles('temp_upload');
  }
}