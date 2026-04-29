import { Module } from '@nestjs/common';
import { LocationService } from './services/location.service';
import { LocationAdapter } from '@infrastructure/prisma/repositories/location/location.adapter';
import { LOCATION_REPOSITORY_TOKEN } from '@domain/location/ports/location.repository.token';

@Module({
  providers: [
    LocationService,
    { provide: LOCATION_REPOSITORY_TOKEN, useClass: LocationAdapter },
  ],
  exports: [LocationService, LOCATION_REPOSITORY_TOKEN],
})
export class LocationModule {}
