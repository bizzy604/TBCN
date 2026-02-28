import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachesController } from './coaches.controller';
import { SessionsController } from './sessions.controller';
import { CoachingService } from './coaching.service';
import { AvailabilityService } from './availability.service';
import { SessionsService } from './sessions.service';
import { User } from '../users/entities/user.entity';
import { CoachProfile } from './entities/coach-profile.entity';
import { CoachAvailability } from './entities/coach-availability.entity';
import { CoachBlockedTime } from './entities/coach-blocked-time.entity';
import { CoachingSession } from './entities/coaching-session.entity';
import { SessionFeedback } from './entities/session-feedback.entity';

/**
 * Coaching Module
 * Manages coaching marketplace
 * - Coach profiles and availability
 * - Session booking
 * - Calendar management
 * - Session reviews
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CoachProfile,
      CoachAvailability,
      CoachBlockedTime,
      CoachingSession,
      SessionFeedback,
    ]),
  ],
  controllers: [CoachesController, SessionsController],
  providers: [CoachingService, AvailabilityService, SessionsService],
  exports: [CoachingService, AvailabilityService, SessionsService, TypeOrmModule],
})
export class CoachingModule {}
