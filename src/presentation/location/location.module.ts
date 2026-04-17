import { Module } from '@nestjs/common';
import { PublicLocationController } from './controllers/public-location.controller';
import { InternalLocationController } from './controllers/internal-location.controller';
import { LocationService } from '@application/location/services/location.service';
import { LocationAdapter } from '@infrastructure/prisma/repositories/location/location.adapter';
import { LOCATION_REPOSITORY_TOKEN } from '@domain/location/ports/location.repository.token';

@Module({
  controllers: [PublicLocationController, InternalLocationController],
  providers: [
    LocationService,
    { provide: LOCATION_REPOSITORY_TOKEN, useClass: LocationAdapter },
  ],
  exports: [LocationService],
})
export class LocationModule {}
