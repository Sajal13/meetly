import { IsBoolean, IsJWT, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminLogoutDto {
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;

  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}
