import { IsJWT, IsNotEmpty } from 'class-validator';

export class RefreshAdminTokenDto {
  @IsJWT()
  @IsNotEmpty()
  refreshToken: string;
}
