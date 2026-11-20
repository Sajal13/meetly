import { Expose } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../enums/user-status.enum';

export class UserResponseDto {
  @Expose()
  @IsString()
  id: string;

  @Expose()
  @IsString()
  firstName: string;

  @Expose()
  @IsString()
  @IsOptional()
  lasName?: string;

  @Expose()
  @IsString()
  email: string;

  @Expose()
  @IsString()
  @IsOptional()
  phone?: string;

  @Expose()
  @IsEnum(UserStatus)
  status: UserStatus;

  @Expose()
  @IsString()
  @IsOptional()
  type: string;

  @Expose()
  @IsString()
  createdAt: Date;

  @Expose()
  @IsString()
  updatedAt: Date;
}
