import { Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserStatus } from '../enums/user-status.enum';

export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'first_name' })
  firstName: string;

  @Column({ type: 'text', name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', name: 'email', unique: true })
  email: string;

  @Column({ type: 'text', name: 'phone', nullable: true, unique: true })
  phone?: string;

  @Column({ type: 'text', name: 'password' })
  password: string;

  @Column({ type: 'varchar', name: 'refresh_hash', nullable: true })
  refreshHash?: string;

  @Column({ type: 'text', name: 'type', default: 'user' })
  type: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
