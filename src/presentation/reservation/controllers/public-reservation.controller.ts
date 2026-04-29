import { Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { ThrottlePublicWrite } from '@common/decorators/throttle.decorator';
import {
  CheckAvailabilityUseCase,
  CreateReservationUseCase,
  GetReservationByTokenUseCase,
  CancelReservationByTokenUseCase,
} from '@application/reservation/use-cases/reservation.use-cases';
import {
  CheckAvailabilityDto,
  CreateReservationDto,
} from '@application/reservation/dtos/reservation.dto';
import {
  ReservationStatusResponseDto,
} from '../dtos/response/reservation-response.dto';

@ApiTags('Reservation - Public')
@Controller('reservations')
export class PublicReservationController {
  constructor(
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
    private readonly createReservationUseCase: CreateReservationUseCase,
    private readonly getReservationByTokenUseCase: GetReservationByTokenUseCase,
    private readonly cancelReservationByTokenUseCase: CancelReservationByTokenUseCase,
  ) {}

  @Public()
  @Get('availability')
  @ApiOperation({ summary: 'Check available time slots for a date' })
  async checkAvailability(@Query() dto: CheckAvailabilityDto) {
    const result = await this.checkAvailabilityUseCase.execute(dto);
    return {
      data: result,
    };
  }

  @Public()
  @Post()
  @ThrottlePublicWrite()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new reservation' })
  async create(@Body() dto: CreateReservationDto) {
    const reservation = await this.createReservationUseCase.execute(dto);
    return {
      data: {
        id: reservation.id,
        token: reservation.token,
        guestName: reservation.guestName,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
      },
      message: 'Reservation created successfully',
    };
  }

  @Public()
  @Get(':token/status')
  @ApiOperation({ summary: 'Get reservation status by token' })
  async getStatus(@Param('token') token: string) {
    const reservation = await this.getReservationByTokenUseCase.execute(token);
    return {
      data: ReservationStatusResponseDto.from({
        token: reservation.token,
        status: reservation.status,
        guestName: reservation.guestName,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        locationId: reservation.locationId,
      }),
    };
  }

  @Public()
  @Delete(':token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel reservation by token (only PENDING/CONFIRMED)' })
  async cancel(@Param('token') token: string) {
    const reservation = await this.cancelReservationByTokenUseCase.execute(token);
    return {
      data: {
        token: reservation.token,
        status: reservation.status,
      },
      message: 'Reservation cancelled successfully',
    };
  }
}
