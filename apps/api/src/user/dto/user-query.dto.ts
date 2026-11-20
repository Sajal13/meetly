import { PaginationDto } from '@common/dto/pagination.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '../enums/user-status.enum';

export class UserQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
