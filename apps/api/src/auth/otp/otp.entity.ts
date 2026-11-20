import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('otp')
@Index(['identifier', 'createdAt'])
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  identifier: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 128 })
  codeHash: string;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'consumed_at', type: 'timestamptz', nullable: true })
  consumedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
