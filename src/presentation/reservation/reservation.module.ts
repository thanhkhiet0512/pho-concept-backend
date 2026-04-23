import { Module } from '@nestjs/common';
import { PublicReservationController, InternalReservationController } from './controllers';
import {
  CheckAvailabilityUseCase,
  CreateReservationUseCase,
  GetReservationByTokenUseCase,
  CancelReservationByTokenUseCase,
  ListReservationsUseCase,
  GetCalendarViewUseCase,
  AdminCreateReservationUseCase,
  UpdateReservationStatusUseCase,
  GetSlotConfigUseCase,
  UpsertSlotConfigUseCase,
} from '@application/reservation/use-cases/reservation.use-cases';
import { ReservationAdapter, SlotConfigAdapter } from '@infrastructure/prisma/repositories/reservation/reservation.adapter';
import { LocationAdapter } from '@infrastructure/prisma/repositories/location/location.adapter';
import { RESERVATION_REPOSITORY_TOKEN, SLOT_CONFIG_REPOSITORY_TOKEN } from '@domain/reservation/ports/reservation.repository.token';
import { LOCATION_REPOSITORY_TOKEN } from '@domain/location/ports/location.repository.token';

@Module({
  controllers: [PublicReservationController, InternalReservationController],
  providers: [
    // Adapters
    ReservationAdapter,
    SlotConfigAdapter,
    LocationAdapter,
    // Tokens
    { provide: RESERVATION_REPOSITORY_TOKEN, useClass: ReservationAdapter },
    { provide: SLOT_CONFIG_REPOSITORY_TOKEN, useClass: SlotConfigAdapter },
    { provide: LOCATION_REPOSITORY_TOKEN, useClass: LocationAdapter },
    // Use Cases
    CheckAvailabilityUseCase,
    CreateReservationUseCase,
    GetReservationByTokenUseCase,
    CancelReservationByTokenUseCase,
    ListReservationsUseCase,
    GetCalendarViewUseCase,
    AdminCreateReservationUseCase,
    UpdateReservationStatusUseCase,
    GetSlotConfigUseCase,
    UpsertSlotConfigUseCase,
  ],
  exports: [
    RESERVATION_REPOSITORY_TOKEN,
    SLOT_CONFIG_REPOSITORY_TOKEN,
  ],
})
export class ReservationModule {}
