import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushChannel {
  private readonly logger = new Logger(PushChannel.name);

  async send(userId: string, title: string): Promise<void> {
    this.logger.debug(`Push notification queued for ${userId}: ${title}`);
  }
}
