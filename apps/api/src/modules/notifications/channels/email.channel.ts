import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailChannel {
  private readonly logger = new Logger(EmailChannel.name);

  async send(userId: string, title: string): Promise<void> {
    this.logger.debug(`Email notification queued for ${userId}: ${title}`);
  }
}
