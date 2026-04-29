import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { AdminRole } from '@common/enums/admin-role.enum';
import { ParseBigIntPipe } from '@common/pipes/parse-bigint.pipe';
import {
  ListCateringRequestsUseCase, GetCateringRequestDetailUseCase,
  QuoteCateringRequestUseCase, UpdateCateringStatusUseCase,
} from '@application/catering/use-cases/catering.use-cases';
import { ListCateringRequestsDto, QuoteCateringRequestDto, UpdateCateringStatusDto } from '@application/catering/dtos';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Catering - Admin')
@ApiBearerAuth()
@Controller('admin/catering')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternalCateringController {
  constructor(
    private readonly listRequests: ListCateringRequestsUseCase,
    private readonly getDetail: GetCateringRequestDetailUseCase,
    private readonly quoteRequest: QuoteCateringRequestUseCase,
    private readonly updateStatus: UpdateCateringStatusUseCase,
  ) {}

  @Get('requests')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'List catering requests with filters' })
  async list(@Query() dto: ListCateringRequestsDto) {
    const result = await this.listRequests.execute(dto);
    return {
      data: result.data.map((r) => ({
        id: r.id, token: r.token, status: r.status,
        contactName: r.contactName, contactEmail: r.contactEmail, contactPhone: r.contactPhone,
        eventDate: r.eventDate, eventTime: r.eventTime, guestCount: r.guestCount,
        quotedAmount: r.quotedAmount, quotationDeadline: r.quotationDeadline,
        createdAt: r.createdAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('requests/:id')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER, AdminRole.STAFF, AdminRole.VIEW_ONLY)
  @ApiOperation({ summary: 'Get catering request detail with items' })
  async getOne(@Param('id', ParseBigIntPipe) id: bigint) {
    const { request: r, items } = await this.getDetail.execute(id);
    return {
      data: {
        id: r.id, token: r.token, status: r.status,
        locationId: r.locationId, packageId: r.packageId,
        contactName: r.contactName, contactEmail: r.contactEmail, contactPhone: r.contactPhone,
        eventDate: r.eventDate, eventTime: r.eventTime, guestCount: r.guestCount,
        venue: r.venue, city: r.city, state: r.state, zip: r.zip,
        dietaryNotes: r.dietaryNotes, specialRequest: r.specialRequest,
        quotedAmount: r.quotedAmount, depositAmount: r.depositAmount,
        quotationDeadline: r.quotationDeadline, internalNote: r.internalNote,
        handledByAdminId: r.handledByAdminId,
        createdAt: r.createdAt, updatedAt: r.updatedAt,
        items: items.map((i) => ({
          id: i.id, menuItemId: i.menuItemId, customName: i.customName,
          quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.lineTotal, note: i.note,
        })),
      },
    };
  }

  @Post('requests/:id/quote')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send quote to customer' })
  async quote(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: QuoteCateringRequestDto,
    @CurrentUser() currentUser: { id: number },
  ) {
    const request = await this.quoteRequest.execute(id, dto, BigInt(currentUser.id));
    return {
      data: { id: request.id, token: request.token, status: request.status, quotedAmount: request.quotedAmount, quotationDeadline: request.quotationDeadline },
      message: 'Quote sent to customer successfully',
    };
  }

  @Patch('requests/:id/status')
  @Roles(AdminRole.OWNER, AdminRole.MANAGER)
  @ApiOperation({ summary: 'Update catering request status' })
  async updateStatusHandler(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: UpdateCateringStatusDto,
  ) {
    const request = await this.updateStatus.execute(id, dto);
    return {
      data: { id: request.id, token: request.token, status: request.status, updatedAt: request.updatedAt },
    };
  }
}
