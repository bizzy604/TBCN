import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InAppChannel {
  private readonly logger = new Logger(InAppChannel.name);

  async send(userId: string, title: string): Promise<void> {
    this.logger.debug(`In-app notification queued for ${userId}: ${title}`);
  }
}
