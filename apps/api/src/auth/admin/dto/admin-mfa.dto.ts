import { IsJWT, IsString, Matches } from 'class-validator';

export class AdminMfaDto {
  @IsJWT()
  mfaToken: string;

  @IsString()
  @Matches(/^[0-9][6]$/, { message: 'Code must be 6 digits.' })
  code: string;
}
