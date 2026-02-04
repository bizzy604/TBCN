import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserProfile } from './entities';
import { AuthModule } from '../auth/auth.module';

/**
 * Users Module
 * Manages user accounts and profiles
 * - User CRUD operations
 * - Profile management
 * - Avatar uploads
 * - Role assignments
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
