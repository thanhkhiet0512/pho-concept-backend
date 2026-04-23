import { Module } from '@nestjs/common';
import { PublicCateringController, InternalCateringController } from './controllers';
import {
  GetCateringPackagesUseCase, SubmitCateringInquiryUseCase, GetCateringByTokenUseCase,
  ListCateringRequestsUseCase, GetCateringRequestDetailUseCase,
  QuoteCateringRequestUseCase, UpdateCateringStatusUseCase,
} from '@application/catering/use-cases/catering.use-cases';
import { CateringRequestAdapter } from '@infrastructure/prisma/repositories/catering/catering-request.adapter';
import { CateringPackageAdapter } from '@infrastructure/prisma/repositories/catering/catering-package.adapter';
import { CATERING_REQUEST_REPOSITORY_TOKEN, CATERING_PACKAGE_REPOSITORY_TOKEN } from '@domain/catering/ports/catering.repository.token';
import { QueueModule } from '@infrastructure/queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [PublicCateringController, InternalCateringController],
  providers: [
    CateringRequestAdapter,
    CateringPackageAdapter,
    { provide: CATERING_REQUEST_REPOSITORY_TOKEN, useClass: CateringRequestAdapter },
    { provide: CATERING_PACKAGE_REPOSITORY_TOKEN, useClass: CateringPackageAdapter },
    GetCateringPackagesUseCase,
    SubmitCateringInquiryUseCase,
    GetCateringByTokenUseCase,
    ListCateringRequestsUseCase,
    GetCateringRequestDetailUseCase,
    QuoteCateringRequestUseCase,
    UpdateCateringStatusUseCase,
  ],
})
export class CateringModule {}
