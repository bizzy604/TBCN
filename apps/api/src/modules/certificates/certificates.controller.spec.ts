import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@tbcn/shared';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

describe('CertificatesController', () => {
  let controller: CertificatesController;

  const mockCertificatesService = {
    generate: jest.fn(),
    findMyCertificates: jest.fn(),
    verifyByCode: jest.fn(),
    findByEnrollment: jest.fn(),
    findById: jest.fn(),
    revoke: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CertificatesController],
      providers: [{ provide: CertificatesService, useValue: mockCertificatesService }],
    }).compile();

    controller = module.get<CertificatesController>(CertificatesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should generate certificate', async () => {
    mockCertificatesService.generate.mockResolvedValueOnce({ id: 'cert-1' });

    const result = await controller.generate(
      { enrollmentId: 'a485720c-5c7a-4110-a794-99eec1d7d8fd' },
      'admin-1',
    );

    expect(result).toEqual({ id: 'cert-1' });
    expect(mockCertificatesService.generate).toHaveBeenCalledWith(
      { enrollmentId: 'a485720c-5c7a-4110-a794-99eec1d7d8fd' },
      'admin-1',
    );
  });

  it('should get my certificates', async () => {
    const payload = { items: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    mockCertificatesService.findMyCertificates.mockResolvedValueOnce(payload);

    const result = await controller.getMine('user-1', 1, 10);

    expect(result).toEqual(payload);
    expect(mockCertificatesService.findMyCertificates).toHaveBeenCalledWith(
      'user-1',
      1,
      10,
    );
  });

  it('should verify by code', async () => {
    mockCertificatesService.verifyByCode.mockResolvedValueOnce({
      id: 'cert-1',
      isValid: true,
    });

    const result = await controller.verify('ABCDEF12');

    expect(result.valid).toBe(true);
    expect(mockCertificatesService.verifyByCode).toHaveBeenCalledWith('ABCDEF12');
  });

  it('should get certificate by id', async () => {
    mockCertificatesService.findById.mockResolvedValueOnce({ id: 'cert-1' });

    const result = await controller.getById('cert-1', 'user-1', UserRole.MEMBER);

    expect(result).toEqual({ id: 'cert-1' });
    expect(mockCertificatesService.findById).toHaveBeenCalledWith('cert-1', {
      id: 'user-1',
      role: UserRole.MEMBER,
    });
  });
});
