import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { Certificate } from './entities/certificate.entity';
import { CertificatesController } from './certificates.controller';
import { CertificatesRepository } from './certificates.repository';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Certificate]), EnrollmentsModule],
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificatesRepository],
  exports: [CertificatesService, CertificatesRepository, TypeOrmModule],
})
export class CertificatesModule {}
