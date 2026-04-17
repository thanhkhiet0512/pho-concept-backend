import { InjectionToken } from '@nestjs/common';
import { LocationRepositoryPort } from '@domain/location/ports/location.repository.port';

export const LOCATION_REPOSITORY = Symbol('LOCATION_REPOSITORY');

export const LOCATION_REPOSITORY_TOKEN: InjectionToken<LocationRepositoryPort> = LOCATION_REPOSITORY;
