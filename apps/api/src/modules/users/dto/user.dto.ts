import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsUrl,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  Max,
  IsObject,
  IsEnum,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities';

/**
 * Create User DTO (Admin only)
 */
export class CreateUserDto {
  @ApiProperty({ description: 'User email', example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ description: 'User role', enum: UserRole, default: UserRole.MEMBER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

/**
 * Update User DTO
 */
export class UpdateUserDto {
  @ApiProperty({ description: 'First name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({ description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: 'Timezone', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Locale', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}

/**
 * Update Profile DTO
 */
export class UpdateProfileDto {
  @ApiProperty({ description: 'Bio/About', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({ description: 'Professional headline', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headline?: string;

  @ApiProperty({ description: 'Company name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company?: string;

  @ApiProperty({ description: 'Job title', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  jobTitle?: string;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ description: 'LinkedIn profile URL', required: false })
  @IsOptional()
  @IsUrl()
  linkedinUrl?: string;

  @ApiProperty({ description: 'Twitter/X profile URL', required: false })
  @IsOptional()
  @IsUrl()
  twitterUrl?: string;

  @ApiProperty({ description: 'Instagram profile URL', required: false })
  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @ApiProperty({ description: 'Years of experience', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  yearsExperience?: number;

  @ApiProperty({ description: 'Specializations', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiProperty({ description: 'Certifications', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiProperty({ description: 'Industries served', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industriesServed?: string[];
}

/**
 * Update Notification Preferences DTO
 */
export class UpdateNotificationPreferencesDto {
  @ApiProperty({ description: 'Email notification preferences', required: false })
  @IsOptional()
  @IsObject()
  email?: {
    marketing: boolean;
    updates: boolean;
    reminders: boolean;
  };

  @ApiProperty({ description: 'Push notification preferences', required: false })
  @IsOptional()
  @IsObject()
  push?: {
    enabled: boolean;
    messages: boolean;
    reminders: boolean;
  };

  @ApiProperty({ description: 'SMS notification preferences', required: false })
  @IsOptional()
  @IsObject()
  sms?: {
    enabled: boolean;
    reminders: boolean;
  };
}

/**
 * Admin Update User DTO
 */
export class AdminUpdateUserDto extends PartialType(UpdateUserDto) {
  @ApiProperty({ description: 'User role', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'User status', enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: 'Email verified flag', required: false })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}

/**
 * User Query DTO (for filtering/searching)
 */
export class UserQueryDto {
  @ApiProperty({ description: 'Search query', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by role', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'Filter by status', enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ description: 'Items per page', required: false, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
