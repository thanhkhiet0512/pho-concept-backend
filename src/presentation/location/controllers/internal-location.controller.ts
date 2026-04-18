import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from '@application/location/services/location.service';
import { CreateLocationDto, UpdateLocationDto, LocationHourDto } from '@application/location/dtos/location.dto';
import { LocationResponseDto } from '../dtos/response/location-response.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';

@ApiTags('Locations - Admin')
@ApiBearerAuth()
@Controller('i/locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternalLocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get()
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Get all locations (including inactive)' })
  async findAll() {
    const locations = await this.locationService.findAll();
    return LocationResponseDto.toList(locations);
  }

  @Post()
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Create new location' })
  async create(@Body() dto: CreateLocationDto) {
    const location = await this.locationService.create(dto);
    return LocationResponseDto.from(location);
  }

  @Put(':id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update location' })
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateLocationDto,
  ) {
    const location = await this.locationService.update(id, dto);
    return LocationResponseDto.from(location);
  }

  @Patch(':id/hours')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update location hours' })
  async updateHours(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() hours: LocationHourDto[],
  ) {
    await this.locationService.updateHours(id, hours);
    const location = await this.locationService.findById(id);
    return LocationResponseDto.from(location);
  }

  @Patch(':id/toggle')
  @Roles(AdminRole.OWNER)
  @ApiOperation({ summary: 'Toggle location active status' })
  async toggle(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body('isActive') isActive: boolean,
  ) {
    await this.locationService.toggle(id, isActive);
    const location = await this.locationService.findById(id);
    return LocationResponseDto.from(location);
  }
}
