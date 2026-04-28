import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('i/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'KPI overview: reservations, catering, customers, operations' })
  async getOverview() {
    return this.dashboardService.getOverview();
  }

  @Get('charts')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Time-series charts: reservations, catering, new customers' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'], description: 'Default: 30d' })
  async getCharts(@Query('range') range?: string) {
    const validRange = range === '7d' || range === '90d' ? range : '30d';
    return this.dashboardService.getCharts(validRange);
  }

  @Get('recent-activities')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Recent activities feed: reservations, catering, customers, posts' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Default: 20' })
  async getRecentActivities(@Query('limit') limit?: string) {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 50) : 20;
    return this.dashboardService.getRecentActivities(parsedLimit);
  }

  @Get('top-items')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Top items: menu categories, catering packages, top posts' })
  @ApiQuery({ name: 'range', required: false, enum: ['7d', '30d', '90d'], description: 'Default: 30d' })
  async getTopItems(@Query('range') range?: string) {
    const validRange = range === '7d' || range === '90d' ? range : '30d';
    return this.dashboardService.getTopItems(validRange);
  }

  @Get('branches')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Per-branch stats: reservations, catering' })
  async getBranches() {
    return this.dashboardService.getBranches();
  }
}
