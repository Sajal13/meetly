import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../roles/entities/role.entity';

/**
 * Internal/staff account. Intentionally a separate entity + auth
 * pipeline from the end-user `User` entity (never shared tokens,
 * never shared tables) per the architecture's admin/user separation.
 */
@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ default: true })
  isActive: boolean;

  // MFA (per auth/admin/dto/admin-mfa.dto.ts in the folder structure)
  @Exclude()
  @Column({ name: 'mfa_secret', nullable: true })
  mfaSecret: string | null;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'admin_roles',
    joinColumn: { name: 'admin_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
