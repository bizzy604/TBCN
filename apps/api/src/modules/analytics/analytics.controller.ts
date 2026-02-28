import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@tbcn/shared';
import { Roles } from '../../common/decorators';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth('JWT-auth')
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin/overview')
  @ApiOperation({ summary: 'Admin dashboard metrics' })
  async adminOverview(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAdminOverview(query);
  }

  @Get('admin/activity')
  @ApiOperation({ summary: 'Admin recent activity feed' })
  async adminActivity(@Query('limit') limit?: number) {
    return this.analyticsService.getRecentActivity(limit);
  }
}
