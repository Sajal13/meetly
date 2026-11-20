import type { SubjectType } from '@common/types/auth.types';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['subjectId', 'subjectType'])
export class RefreshToken {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @Column({ name: 'subject_type', type: 'varchar', length: 10 })
  subjectType: SubjectType;

  @Column({ name: 'token_hash', type: 'varchar', length: 64 })
  tokenHash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  ip: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
