import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from './entities/certificate.entity';

@Injectable()
export class CertificatesRepository {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,
  ) {}

  async create(data: Partial<Certificate>): Promise<Certificate> {
    const certificate = this.certificateRepo.create(data);
    return this.certificateRepo.save(certificate);
  }

  async findById(id: string, relations: string[] = []): Promise<Certificate | null> {
    return this.certificateRepo.findOne({
      where: { id },
      relations,
    });
  }

  async findByEnrollmentId(enrollmentId: string): Promise<Certificate | null> {
    return this.certificateRepo.findOne({
      where: { enrollmentId },
    });
  }

  async findByVerificationCode(verificationCode: string): Promise<Certificate | null> {
    return this.certificateRepo.findOne({
      where: { verificationCode },
    });
  }

  async findByCertificateNumber(certificateNumber: string): Promise<Certificate | null> {
    return this.certificateRepo.findOne({
      where: { certificateNumber },
    });
  }

  async findByUserId(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Certificate[]; total: number }> {
    const [data, total] = await this.certificateRepo.findAndCount({
      where: { userId },
      order: { issuedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async update(id: string, data: Partial<Certificate>): Promise<Certificate> {
    await this.certificateRepo.update(id, data);
    return this.findById(id);
  }
}
