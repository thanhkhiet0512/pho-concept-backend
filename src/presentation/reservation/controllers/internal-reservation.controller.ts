import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import {
  ListReservationsUseCase,
  GetCalendarViewUseCase,
  AdminCreateReservationUseCase,
  UpdateReservationStatusUseCase,
  GetSlotConfigUseCase,
  UpsertSlotConfigUseCase,
} from '@application/reservation/use-cases/reservation.use-cases';
import {
  AdminCreateReservationDto,
  UpdateReservationStatusDto,
  ListReservationsDto,
  GetCalendarDto,
  UpsertSlotConfigDto,
} from '@application/reservation/dtos/reservation.dto';
import {
  ReservationResponseDto,
  SlotConfigResponseDto,
} from '../dtos/response/reservation-response.dto';

@ApiTags('Reservation - Admin')
@ApiBearerAuth()
@Controller('admin/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternalReservationController {
  constructor(
    private readonly listReservationsUseCase: ListReservationsUseCase,
    private readonly getCalendarViewUseCase: GetCalendarViewUseCase,
    private readonly adminCreateReservationUseCase: AdminCreateReservationUseCase,
    private readonly updateReservationStatusUseCase: UpdateReservationStatusUseCase,
    private readonly getSlotConfigUseCase: GetSlotConfigUseCase,
    private readonly upsertSlotConfigUseCase: UpsertSlotConfigUseCase,
  ) {}

  @Get()
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'List reservations with filters' })
  async list(@Query() dto: ListReservationsDto) {
    const result = await this.listReservationsUseCase.execute(dto);
    return {
      data: result.data.map((r) => ReservationResponseDto.from({
        id: r.id,
        token: r.token,
        locationId: r.locationId,
        guestName: r.guestName,
        guestEmail: r.guestEmail,
        guestPhone: r.guestPhone,
        partySize: r.partySize,
        reservationDate: r.reservationDate,
        reservationTime: r.reservationTime,
        status: r.status,
        specialRequest: r.specialRequest,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('calendar')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get calendar view for a month' })
  async getCalendar(@Query() dto: GetCalendarDto) {
    const result = await this.getCalendarViewUseCase.execute(dto);
    return {
      data: {
        month: result.month,
        locationId: result.locationId,
        days: result.days.map((day) => ({
          date: day.date,
          totalReservations: day.totalReservations,
          totalGuests: day.totalGuests,
          reservations: day.reservations.map((r) => ReservationResponseDto.from({
            id: r.id,
            token: r.token,
            locationId: r.locationId,
            guestName: r.guestName,
            guestEmail: r.guestEmail,
            guestPhone: r.guestPhone,
            partySize: r.partySize,
            reservationDate: r.reservationDate,
            reservationTime: r.reservationTime,
            status: r.status,
            specialRequest: r.specialRequest,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
          })),
        })),
      },
    };
  }

  @Post()
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create walk-in reservation' })
  async create(
    @Body() dto: AdminCreateReservationDto,
    @CurrentUser() currentUser: { id: number },
  ) {
    const adminId = BigInt(currentUser.id);
    const reservation = await this.adminCreateReservationUseCase.execute(dto, adminId);
    return {
      data: ReservationResponseDto.from({
        id: reservation.id,
        token: reservation.token,
        locationId: reservation.locationId,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        guestPhone: reservation.guestPhone,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        specialRequest: reservation.specialRequest,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      }),
    };
  }

  @Patch(':id/status')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF)
  @ApiOperation({ summary: 'Update reservation status' })
  async updateStatus(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    const reservation = await this.updateReservationStatusUseCase.execute(id, dto);
    return {
      data: ReservationResponseDto.from({
        id: reservation.id,
        token: reservation.token,
        locationId: reservation.locationId,
        guestName: reservation.guestName,
        guestEmail: reservation.guestEmail,
        guestPhone: reservation.guestPhone,
        partySize: reservation.partySize,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        status: reservation.status,
        specialRequest: reservation.specialRequest,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
      }),
    };
  }

  @Get('slot-config/:locationId')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Get slot configuration for a location' })
  async getSlotConfig(@Param('locationId', ParseBigIntPipe) locationId: bigint) {
    const config = await this.getSlotConfigUseCase.execute(locationId);
    if (!config) {
      return { data: null, message: 'No slot configuration found for this location' };
    }
    return {
      data: SlotConfigResponseDto.from({
        id: config.id,
        locationId: config.locationId,
        slotDuration: config.slotDuration,
        maxGuestsPerSlot: config.maxGuestsPerSlot,
        minAdvanceHours: config.minAdvanceHours,
        maxAdvanceDays: config.maxAdvanceDays,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }),
    };
  }

  @Patch('slot-config/:locationId')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Create or update slot configuration' })
  async upsertSlotConfig(
    @Param('locationId', ParseBigIntPipe) locationId: bigint,
    @Body() dto: UpsertSlotConfigDto,
  ) {
    const config = await this.upsertSlotConfigUseCase.execute(locationId, dto);
    return {
      data: SlotConfigResponseDto.from({
        id: config.id,
        locationId: config.locationId,
        slotDuration: config.slotDuration,
        maxGuestsPerSlot: config.maxGuestsPerSlot,
        minAdvanceHours: config.minAdvanceHours,
        maxAdvanceDays: config.maxAdvanceDays,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      }),
    };
  }
}
