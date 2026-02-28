import {
  Entity,
  Column,
  Index,
  Unique,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities';
import { User } from '../../users/entities/user.entity';
import { Program } from '../../programs/entities/program.entity';
import { Enrollment } from '../../enrollments/entities/enrollment.entity';

@Entity('certificates')
@Unique('uq_certificate_enrollment', ['enrollmentId'])
@Unique('uq_certificate_number', ['certificateNumber'])
@Unique('uq_certificate_verification_code', ['verificationCode'])
@Index('idx_certificates_user', ['userId'])
@Index('idx_certificates_program', ['programId'])
@Index('idx_certificates_code', ['verificationCode'])
export class Certificate extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Program, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'program_id', type: 'uuid' })
  programId: string;

  @OneToOne(() => Enrollment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: Enrollment;

  @Column({ name: 'enrollment_id', type: 'uuid' })
  enrollmentId: string;

  @Column({ name: 'certificate_number', type: 'varchar', length: 64 })
  certificateNumber: string;

  @Column({ name: 'verification_code', type: 'varchar', length: 64 })
  verificationCode: string;

  @Column({ name: 'recipient_name', type: 'varchar', length: 255 })
  recipientName: string;

  @Column({ name: 'program_title', type: 'varchar', length: 255 })
  programTitle: string;

  @Column({ name: 'completion_date', type: 'timestamptz', nullable: true })
  completionDate: Date | null;

  @Column({ name: 'issued_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @Column({ name: 'issued_by', type: 'uuid', nullable: true })
  issuedBy: string | null;

  @Column({ name: 'download_url', type: 'text', nullable: true })
  downloadUrl: string | null;

  @Column({ name: 'metadata', type: 'jsonb', default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked: boolean;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'revoked_reason', type: 'text', nullable: true })
  revokedReason: string | null;

  get isValid(): boolean {
    return !this.isRevoked;
  }
}
