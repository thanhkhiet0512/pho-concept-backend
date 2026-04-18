import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from '@application/location/services/location.service';
import { LocationResponseDto } from '../dtos/response/location-response.dto';
import { Public } from '@common/decorators/public.decorator';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';

@ApiTags('Locations - Public')
@Controller('p/locations')
export class PublicLocationController {
  constructor(private readonly locationService: LocationService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active locations' })
  async findAll(): Promise<LocationResponseDto[]> {
    const locations = await this.locationService.findAll();
    return LocationResponseDto.toList(locations);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get location by id' })
  async findOne(@Param('id', ParseBigIntPipe) id: bigint): Promise<LocationResponseDto> {
    const location = await this.locationService.findById(id);
    return LocationResponseDto.from(location);
  }
}
