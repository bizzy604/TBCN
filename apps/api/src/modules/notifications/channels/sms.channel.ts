import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsChannel {
  private readonly logger = new Logger(SmsChannel.name);

  async send(userId: string, title: string): Promise<void> {
    this.logger.debug(`SMS notification queued for ${userId}: ${title}`);
  }
}
