import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailEventListener } from './email-event.listener';

/**
 * Email Module
 * Provides email sending capabilities via Nodemailer (SMTP)
 * Global module — available throughout the application without explicit imports
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailEventListener],
  exports: [EmailService],
})
export class EmailModule {}
