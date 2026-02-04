import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  AdminUpdateUserDto,
  UserQueryDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '@/common/guards';
import { CurrentUser, Roles, Role } from '@/common/decorators';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============================================
  // Current User Endpoints
  // ============================================

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user with profile' })
  async getCurrentUser(@CurrentUser('sub') userId: string) {
    return this.usersService.findByIdWithProfile(userId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async updateCurrentUser(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, dto);
  }

  @Put('me/profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateCurrentUserProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Upload avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Avatar uploaded' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // TODO: Upload to S3 and get URL
    const avatarUrl = `https://placeholder.com/avatars/${userId}.jpg`;
    await this.usersService.updateAvatar(userId, avatarUrl);
    return { avatarUrl };
  }

  // ============================================
  // Admin Endpoints
  // ============================================

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'List all users (Admin)' })
  @ApiResponse({ status: 200, description: 'Paginated users list' })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin)' })
  @ApiResponse({ status: 201, description: 'User created' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get('stats')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get user statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'User stats by role' })
  async getStats() {
    return this.usersService.getCountByRole();
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'User details' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findByIdWithProfile(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin)' })
  @ApiResponse({ status: 200, description: 'User updated' })
  async adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user (Super Admin)' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.delete(id);
  }
}
