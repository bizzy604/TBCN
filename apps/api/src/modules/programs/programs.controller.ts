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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CreateProgramDto, CreateModuleDto, CreateLessonDto } from './dto/create-program.dto';
import { UpdateProgramDto, UpdateModuleDto, UpdateLessonDto } from './dto/update-program.dto';
import { ProgramQueryDto } from './dto/program-query.dto';
import { CurrentUser, Public, Roles } from '../../common/decorators';
import { UserRole } from '@tbcn/shared';

@ApiTags('Programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  // ─── Public Catalog ──────────────────────────────────

  @Public()
  @Get('catalog')
  @ApiOperation({ summary: 'Browse published programs (public)' })
  @ApiResponse({ status: 200, description: 'Paginated list of published programs' })
  async getCatalog(@Query() query: ProgramQueryDto) {
    return this.programsService.findPublished(query);
  }

  @Public()
  @Get('catalog/:slug')
  @ApiOperation({ summary: 'Get program by slug (public)' })
  @ApiParam({ name: 'slug', description: 'Program URL slug' })
  @ApiResponse({ status: 200, description: 'Program details' })
  async getBySlug(@Param('slug') slug: string) {
    return this.programsService.findBySlug(slug);
  }

  // ─── Authenticated CRUD ──────────────────────────────

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'List all programs (admin/coach)' })
  @ApiResponse({ status: 200, description: 'Paginated list of programs' })
  async findAll(@Query() query: ProgramQueryDto) {
    return this.programsService.findAll(query);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get program statistics' })
  async getStats() {
    return this.programsService.getStats();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get program by ID' })
  @ApiParam({ name: 'id', description: 'Program UUID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.programsService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Create a new program' })
  @ApiResponse({ status: 201, description: 'Program created' })
  async create(
    @Body() dto: CreateProgramDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.create(dto, userId);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Update a program' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProgramDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.update(id, dto, userId);
  }

  @Patch(':id/publish')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Publish a program' })
  async publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.publish(id, userId);
  }

  @Patch(':id/archive')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Archive a program' })
  async archive(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.archive(id, userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a program' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.programsService.delete(id, userId);
  }

  // ─── Modules ─────────────────────────────────────────

  @Get(':programId/modules')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List modules for a program' })
  async getModules(@Param('programId', ParseUUIDPipe) programId: string) {
    return this.programsService.findModulesByProgramId(programId);
  }

  @Post(':programId/modules')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Add a module to a program' })
  async createModule(
    @Param('programId', ParseUUIDPipe) programId: string,
    @Body() dto: CreateModuleDto,
  ) {
    return this.programsService.createModule(programId, dto);
  }

  @Put('modules/:moduleId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Update a module' })
  async updateModule(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: UpdateModuleDto,
  ) {
    return this.programsService.updateModule(moduleId, dto);
  }

  @Delete('modules/:moduleId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a module' })
  async deleteModule(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.programsService.deleteModule(moduleId);
  }

  // ─── Lessons ─────────────────────────────────────────

  @Get('modules/:moduleId/lessons')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List lessons for a module' })
  async getLessons(@Param('moduleId', ParseUUIDPipe) moduleId: string) {
    return this.programsService.findLessonsByModuleId(moduleId);
  }

  @Get('lessons/:lessonId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get lesson by ID' })
  async getLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.programsService.findLessonById(lessonId);
  }

  @Post('modules/:moduleId/lessons')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Add a lesson to a module' })
  async createLesson(
    @Param('moduleId', ParseUUIDPipe) moduleId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.programsService.createLesson(moduleId, dto);
  }

  @Put('lessons/:lessonId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @ApiOperation({ summary: 'Update a lesson' })
  async updateLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.programsService.updateLesson(lessonId, dto);
  }

  @Delete('lessons/:lessonId')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.COACH)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a lesson' })
  async deleteLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.programsService.deleteLesson(lessonId);
  }
}
