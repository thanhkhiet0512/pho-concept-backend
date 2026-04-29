import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { GetCateringPackagesUseCase, SubmitCateringInquiryUseCase, GetCateringByTokenUseCase } from '@application/catering/use-cases/catering.use-cases';
import { SubmitCateringInquiryDto } from '@application/catering/dtos';
import { ThrottlePublicWrite } from '@common/decorators/throttle.decorator';

@ApiTags('Catering - Public')
@Controller('catering')
export class PublicCateringController {
  constructor(
    private readonly getPackages: GetCateringPackagesUseCase,
    private readonly submitInquiry: SubmitCateringInquiryUseCase,
    private readonly getByToken: GetCateringByTokenUseCase,
  ) {}

  @Public()
  @Get('packages')
  @ApiOperation({ summary: 'Get all active catering packages' })
  async listPackages() {
    const packages = await this.getPackages.execute();
    return {
      data: packages.map((p) => ({
        id: p.id,
        name: p.name,
        descriptionI18n: p.descriptionI18n,
        minGuests: p.minGuests,
        maxGuests: p.maxGuests,
        basePrice: p.basePrice,
        includesI18n: p.includesI18n,
        sortOrder: p.sortOrder,
      })),
    };
  }

  @Public()
  @Post('inquiries')
  @ThrottlePublicWrite()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a catering inquiry' })
  async submitInquiryHandler(@Body() dto: SubmitCateringInquiryDto) {
    const request = await this.submitInquiry.execute(dto);
    return {
      data: {
        id: request.id,
        token: request.token,
        status: request.status,
        contactName: request.contactName,
        eventDate: request.eventDate,
        eventTime: request.eventTime,
        guestCount: request.guestCount,
      },
      message: 'Your catering inquiry has been received. We will contact you within 24 hours.',
    };
  }

  @Public()
  @Get(':token')
  @ApiOperation({ summary: 'Get catering request status by token' })
  async getStatus(@Param('token') token: string) {
    const request = await this.getByToken.execute(token);
    return {
      data: {
        token: request.token,
        status: request.status,
        contactName: request.contactName,
        eventDate: request.eventDate,
        eventTime: request.eventTime,
        guestCount: request.guestCount,
        quotedAmount: request.quotedAmount,
        quotationDeadline: request.quotationDeadline,
      },
    };
  }
}
